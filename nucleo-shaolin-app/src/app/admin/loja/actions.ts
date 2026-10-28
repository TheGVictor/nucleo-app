'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_PRODUCTS } from '@/lib/store-defaults'
import type { Product, ProductOrder, OrderStatus } from '@/types/database'

export async function getAdminProductsAction(): Promise<Product[]> {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data as Product[]
    }

    // Se a tabela estiver vazia, tenta auto-popular com os produtos padrão para permitir estoque dinâmico
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

export async function getAdminOrdersAction(): Promise<ProductOrder[]> {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('product_orders')
      .select(`
        *,
        student:profiles(id, full_name, phone),
        product:products(id, name, price, image_url, category)
      `)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as unknown as ProductOrder[]
  } catch {
    return []
  }
}

interface SaveProductInput {
  id?: string
  name: string
  description?: string
  price: number
  category: string
  stock?: number
  image_url?: string
  active?: boolean
}

export async function saveProductAction(input: SaveProductInput) {
  try {
    const adminClient = createAdminClient()

    if (input.id && !input.id.startsWith('prod-')) {
      // Atualização de produto existente
      const { error } = await adminClient
        .from('products')
        .update({
          name: input.name,
          description: input.description || null,
          price: input.price,
          category: input.category,
          stock: input.stock ?? 10,
          image_url: input.image_url || null,
          active: input.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)

      if (error) throw error
    } else {
      // Inserção de novo produto
      const { error } = await adminClient.from('products').insert({
        name: input.name,
        description: input.description || null,
        price: input.price,
        category: input.category,
        stock: input.stock ?? 10,
        image_url: input.image_url || null,
        active: input.active ?? true,
      })

      if (error) throw error
    }

    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar produto'
    return { success: false, error: msg }
  }
}

export async function toggleProductActiveAction(id: string, currentActive: boolean) {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('products')
      .update({ active: !currentActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao alternar status do produto'
    return { success: false, error: msg }
  }
}

export async function deleteProductAction(id: string) {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('products').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir produto'
    return { success: false, error: msg }
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const adminClient = createAdminClient()

    // Busca o pedido para verificar transição de status e repor/deduzir estoque
    const { data: order } = await adminClient
      .from('product_orders')
      .select('id, product_id, quantity, status')
      .eq('id', orderId)
      .single()

    if (order && order.product_id && !order.product_id.startsWith('prod-') && order.product_id !== '00000000-0000-0000-0000-000000000000') {
      const qty = Number(order.quantity) || 1

      // Se foi cancelado a partir de um estado ativo, devolve as unidades ao estoque
      if (status === 'cancelled' && order.status !== 'cancelled') {
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
      // Se foi reativado a partir de cancelado, deduz novamente do estoque
      else if (order.status === 'cancelled' && status !== 'cancelled') {
        const { data: prod } = await adminClient
          .from('products')
          .select('id, stock')
          .eq('id', order.product_id)
          .single()

        if (prod && prod.stock !== null) {
          await adminClient
            .from('products')
            .update({ stock: Math.max(0, prod.stock - qty), updated_at: new Date().toISOString() })
            .eq('id', prod.id)
        }
      }
    }

    const { error } = await adminClient
      .from('product_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw error
    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar pedido'
    return { success: false, error: msg }
  }
}

export async function deleteOrderAction(orderId: string) {
  try {
    const adminClient = createAdminClient()

    const { data: order } = await adminClient
      .from('product_orders')
      .select('id, product_id, quantity, status')
      .eq('id', orderId)
      .single()

    if (order && order.status !== 'cancelled' && order.product_id && !order.product_id.startsWith('prod-') && order.product_id !== '00000000-0000-0000-0000-000000000000') {
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

    const { error } = await adminClient.from('product_orders').delete().eq('id', orderId)
    if (error) throw error
    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir pedido'
    return { success: false, error: msg }
  }
}

export async function updateProductStockAction(productId: string, newStock: number) {
  try {
    const adminClient = createAdminClient()
    const safeStock = Math.max(0, Math.floor(newStock))

    const { error } = await adminClient
      .from('products')
      .update({ stock: safeStock, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) throw error
    revalidatePath('/admin/loja')
    revalidatePath('/aluno/loja')
    return { success: true, stock: safeStock }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar estoque'
    return { success: false, error: msg }
  }
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'Nenhum arquivo enviado.' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'A imagem deve ter no máximo 5MB.' }
    }

    const adminClient = createAdminClient()

    // Garante que o bucket 'products' exista
    try {
      await adminClient.storage.createBucket('products', { public: true })
    } catch {}

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `produto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await adminClient.storage
      .from('products')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: 'Falha no upload da imagem: ' + uploadError.message }
    }

    const { data: publicUrlData } = adminClient.storage
      .from('products')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao processar imagem.' }
  }
}

