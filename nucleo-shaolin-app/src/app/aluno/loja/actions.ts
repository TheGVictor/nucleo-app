'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product, ProductOrder, OrderPaymentMethod } from '@/types/database'

import { DEFAULT_PRODUCTS } from '@/lib/store-defaults'

export async function getStoreProductsAction(): Promise<Product[]> {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (!error && data && data.length > 0) {
      return data as Product[]
    }

    if (!error && data && data.length === 0) {
      try {
        const toInsert = DEFAULT_PRODUCTS.map((p) => ({
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          stock: p.stock ?? 10,
          active: true,
        }))
        const { data: inserted, error: insertErr } = await adminClient
          .from('products')
          .insert(toInsert)
          .select('*')

        if (!insertErr && inserted && inserted.length > 0) {
          return inserted as Product[]
        }
      } catch {
        // Fallback silencioso
      }
    }

    return DEFAULT_PRODUCTS
  } catch {
    return DEFAULT_PRODUCTS
  }
}

export async function getStudentOrdersAction(): Promise<ProductOrder[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('product_orders')
      .select('*, product:products(id, name, price, image_url, category)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as unknown as ProductOrder[]
  } catch {
    return []
  }
}

interface CreateOrderInput {
  productId: string
  quantity: number
  paymentMethod: OrderPaymentMethod
  notes?: string
}

export async function createProductOrderAction(input: CreateOrderInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' }
    }

    const adminClient = createAdminClient()

    // 1. Busca dados do produto (no banco ou no fallback)
    let productPrice = 0
    let productName = 'Produto'
    let currentStock: number | null = null

    const { data: dbProduct } = await adminClient
      .from('products')
      .select('id, name, price, stock')
      .eq('id', input.productId)
      .single()

    if (dbProduct) {
      productPrice = Number(dbProduct.price)
      productName = dbProduct.name
      currentStock = dbProduct.stock != null ? Number(dbProduct.stock) : null
    } else {
      const fallback = DEFAULT_PRODUCTS.find((p) => p.id === input.productId)
      if (fallback) {
        productPrice = fallback.price
        productName = fallback.name
        currentStock = fallback.stock != null ? Number(fallback.stock) : null
      } else {
        return { success: false, error: 'Produto não encontrado.' }
      }
    }

    const quantity = Math.max(1, input.quantity || 1)

    // Validação de estoque disponível
    if (currentStock !== null && currentStock < quantity) {
      return {
        success: false,
        error:
          currentStock === 0
            ? 'Este produto está esgotado no momento.'
            : `Restam apenas ${currentStock} unidade(s) deste produto em estoque.`,
      }
    }

    const totalPrice = productPrice * quantity

    // 2. Insere pedido
    const { data: order, error } = await adminClient
      .from('product_orders')
      .insert({
        student_id: user.id,
        product_id: input.productId.startsWith('prod-')
          ? '00000000-0000-0000-0000-000000000000'
          : input.productId,
        quantity,
        total_price: totalPrice,
        payment_method: input.paymentMethod,
        status: input.paymentMethod === 'pix' ? 'reserved' : 'reserved',
        notes: input.notes ? `${input.notes} [Produto: ${productName}]` : `[Produto: ${productName}]`,
      })
      .select('id')
      .single()

    if (error) throw error

    // 3. Deduz automaticamente o estoque a cada reserva concluída do aluno
    if (dbProduct && currentStock !== null) {
      const newStock = Math.max(0, currentStock - quantity)
      await adminClient
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', dbProduct.id)
    }

    revalidatePath('/aluno/loja')
    revalidatePath('/admin/loja')

    return {
      success: true,
      orderId: order?.id || 'simulated-id',
      productName,
      totalPrice,
      paymentMethod: input.paymentMethod,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar reserva.'
    return { success: false, error: message }
  }
}

interface UpdateStudentOrderInput {
  orderId: string
  quantity: number
  paymentMethod: OrderPaymentMethod
  notes?: string
}

export async function updateStudentOrderAction(input: UpdateStudentOrderInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' }
    }

    const adminClient = createAdminClient()

    // 1. Busca o pedido para garantir posse e recalcular total
    const { data: order, error: orderErr } = await adminClient
      .from('product_orders')
      .select('*, product:products(id, name, price, stock)')
      .eq('id', input.orderId)
      .eq('student_id', user.id)
      .single()

    if (orderErr || !order) {
      return { success: false, error: 'Reserva não encontrada ou sem permissão.' }
    }

    if (order.status === 'delivered') {
      return { success: false, error: 'Pedidos já entregues não podem ser alterados.' }
    }

    const unitPrice =
      order.product?.price != null
        ? Number(order.product.price)
        : Number(order.total_price) / Math.max(1, order.quantity || 1)

    const oldQuantity = Number(order.quantity) || 1
    const quantity = Math.max(1, input.quantity || 1)
    const delta = quantity - oldQuantity
    const totalPrice = unitPrice * quantity

    // Ajusta o estoque automaticamente caso a quantidade tenha mudado
    if (
      delta !== 0 &&
      order.product_id &&
      !order.product_id.startsWith('prod-') &&
      order.product_id !== '00000000-0000-0000-0000-000000000000'
    ) {
      const { data: prod } = await adminClient
        .from('products')
        .select('id, stock')
        .eq('id', order.product_id)
        .single()

      if (prod && prod.stock !== null) {
        if (delta > 0 && prod.stock < delta) {
          return {
            success: false,
            error: `Não há estoque suficiente. Restam apenas ${prod.stock} unidade(s) adicionais.`,
          }
        }
        const newStock = Math.max(0, prod.stock - delta)
        await adminClient
          .from('products')
          .update({ stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', prod.id)
      }
    }

    const productName =
      order.product?.name ||
      order.notes?.match(/\[Produto:\s*([^\]]+)\]/)?.[1] ||
      'Produto'

    const userNotes = input.notes?.trim() || ''
    const finalNotes = userNotes
      ? `${userNotes} [Produto: ${productName}]`
      : `[Produto: ${productName}]`

    const { error: updateErr } = await adminClient
      .from('product_orders')
      .update({
        quantity,
        total_price: totalPrice,
        payment_method: input.paymentMethod,
        notes: finalNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.orderId)
      .eq('student_id', user.id)

    if (updateErr) throw updateErr

    revalidatePath('/aluno/loja')
    revalidatePath('/admin/loja')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar reserva.'
    return { success: false, error: message }
  }
}

export async function deleteStudentOrderAction(orderId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' }
    }

    const adminClient = createAdminClient()

    // 1. Busca o pedido para repor o estoque se não estiver cancelado
    const { data: order } = await adminClient
      .from('product_orders')
      .select('id, product_id, quantity, status')
      .eq('id', orderId)
      .eq('student_id', user.id)
      .single()

    if (
      order &&
      order.status !== 'cancelled' &&
      order.product_id &&
      !order.product_id.startsWith('prod-') &&
      order.product_id !== '00000000-0000-0000-0000-000000000000'
    ) {
      const qty = Number(order.quantity) || 1
      const { data: prod } = await adminClient
        .from('products')
        .select('id, stock')
        .eq('id', order.product_id)
        .single()

      if (prod && prod.stock !== null) {
        await adminClient
          .from('products')
          .update({ stock: prod.stock + qty, updated_at: new Date().toISOString() })
          .eq('id', prod.id)
      }
    }

    const { error } = await adminClient
      .from('product_orders')
      .delete()
      .eq('id', orderId)
      .eq('student_id', user.id)

    if (error) throw error

    revalidatePath('/aluno/loja')
    revalidatePath('/admin/loja')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir reserva.'
    return { success: false, error: message }
  }
}

export async function confirmStudentPixPaymentAction(orderId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' }
    }

    const adminClient = createAdminClient()

    // 1. Busca o pedido para garantir que pertence ao aluno
    const { data: order, error: fetchErr } = await adminClient
      .from('product_orders')
      .select('id, notes, status, product:products(name)')
      .eq('id', orderId)
      .eq('student_id', user.id)
      .single()

    if (fetchErr || !order) {
      return { success: false, error: 'Pedido não encontrado.' }
    }

    const currentNotes = order.notes || ''
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const updatedNotes = currentNotes.includes('[PIX confirmado pelo aluno')
      ? currentNotes
      : currentNotes
      ? `${currentNotes} [PIX confirmado pelo aluno às ${nowStr}]`
      : `[PIX confirmado pelo aluno às ${nowStr}]`

    const { error: updateErr } = await adminClient
      .from('product_orders')
      .update({
        status: 'paid',
        payment_method: 'pix',
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('student_id', user.id)

    if (updateErr) throw updateErr

    revalidatePath('/aluno/loja')
    revalidatePath('/admin/loja')

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao confirmar pagamento PIX.'
    return { success: false, error: message }
  }
}
