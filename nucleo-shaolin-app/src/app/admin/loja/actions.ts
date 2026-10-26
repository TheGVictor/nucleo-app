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

    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS
    }
    return data as Product[]
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
