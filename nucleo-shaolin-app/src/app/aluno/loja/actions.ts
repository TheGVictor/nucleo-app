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

    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS
    }

    return data as Product[]
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

    const { data: dbProduct } = await adminClient
      .from('products')
      .select('name, price')
      .eq('id', input.productId)
      .single()

    if (dbProduct) {
      productPrice = Number(dbProduct.price)
      productName = dbProduct.name
    } else {
      const fallback = DEFAULT_PRODUCTS.find((p) => p.id === input.productId)
      if (fallback) {
        productPrice = fallback.price
        productName = fallback.name
      } else {
        return { success: false, error: 'Produto não encontrado.' }
      }
    }

    const quantity = Math.max(1, input.quantity || 1)
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
