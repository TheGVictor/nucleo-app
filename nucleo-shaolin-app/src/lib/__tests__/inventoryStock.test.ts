import { describe, it, expect } from 'vitest'
import type { Product, ProductOrder } from '@/types/database'

// Utilitários de lógica de negócio para cálculo e contagem de estoque
export function calculateStockDeduction(currentStock: number, quantityToReserve: number) {
  if (currentStock < quantityToReserve) {
    throw new Error(
      currentStock === 0
        ? 'Este produto está esgotado no momento.'
        : `Restam apenas ${currentStock} unidade(s) deste produto em estoque.`
    )
  }
  return Math.max(0, currentStock - quantityToReserve)
}

export function calculateStockAdjustmentOnOrderUpdate(
  currentStock: number,
  oldQuantity: number,
  newQuantity: number
) {
  const delta = newQuantity - oldQuantity
  if (delta > 0 && currentStock < delta) {
    throw new Error(
      `Não há estoque suficiente. Restam apenas ${currentStock} unidade(s) adicionais.`
    )
  }
  return Math.max(0, currentStock - delta)
}

export function calculateStockRestoration(currentStock: number, quantityToRestore: number) {
  return currentStock + Math.max(0, quantityToRestore)
}

export function computeInventoryStats(products: Partial<Product>[], orders: Partial<ProductOrder>[]) {
  let totalStockUnits = 0
  let totalReservedUnits = 0
  let outOfStockCount = 0
  let lowStockCount = 0
  let okCount = 0

  const ordersByProduct: Record<string, { reserved: number; delivered: number }> = {}

  orders.forEach((o) => {
    const pid = o.product_id || ''
    if (!ordersByProduct[pid]) {
      ordersByProduct[pid] = { reserved: 0, delivered: 0 }
    }
    const q = Number(o.quantity) || 1
    if (o.status === 'reserved' || o.status === 'paid') {
      ordersByProduct[pid].reserved += q
      totalReservedUnits += q
    } else if (o.status === 'delivered') {
      ordersByProduct[pid].delivered += q
    }
  })

  products.forEach((p) => {
    const s = p.stock ?? 0
    totalStockUnits += s
    if (s === 0) {
      outOfStockCount++
    } else if (s <= 3) {
      lowStockCount++
    } else {
      okCount++
    }
  })

  return {
    totalStockUnits,
    totalReservedUnits,
    outOfStockCount,
    lowStockCount,
    okCount,
    ordersByProduct,
  }
}

describe('inventoryStock: Regras de Negócio e Contagem de Estoque para Admin', () => {
  const mockProducts: Partial<Product>[] = [
    { id: 'prod-1', name: 'Uniforme Choy Lay Fut', category: 'Uniformes', price: 180, stock: 10, active: true },
    { id: 'prod-2', name: 'Faixa Bordada', category: 'Faixas', price: 45, stock: 2, active: true },
    { id: 'prod-3', name: 'Luva de Sanda', category: 'Equipamentos', price: 140, stock: 0, active: true },
    { id: 'prod-4', name: 'Camiseta DryFit', category: 'Vestuário', price: 65, stock: 25, active: true },
  ]

  const mockOrders: Partial<ProductOrder>[] = [
    { id: 'ord-1', product_id: 'prod-1', quantity: 2, status: 'reserved' },
    { id: 'ord-2', product_id: 'prod-1', quantity: 1, status: 'paid' },
    { id: 'ord-3', product_id: 'prod-2', quantity: 1, status: 'delivered' },
    { id: 'ord-4', product_id: 'prod-3', quantity: 3, status: 'cancelled' },
  ]

  it('deduz automaticamente o estoque a cada reserva de aluno concluída', () => {
    const currentStock = 10
    const reservedQuantity = 3
    const newStock = calculateStockDeduction(currentStock, reservedQuantity)

    expect(newStock).toBe(7)
  })

  it('impede reserva e acusa erro quando o produto está esgotado (estoque 0)', () => {
    expect(() => calculateStockDeduction(0, 1)).toThrow(
      'Este produto está esgotado no momento.'
    )
  })

  it('impede reserva e acusa erro quando a quantidade solicitada excede o estoque disponível', () => {
    expect(() => calculateStockDeduction(2, 5)).toThrow(
      'Restam apenas 2 unidade(s) deste produto em estoque.'
    )
  })

  it('recalcula o estoque corretamente ao editar uma reserva de aluno (aumentar quantidade)', () => {
    const currentStock = 5
    // Aluno comprou 2 e agora aumentou para 4 (delta = +2)
    const newStock = calculateStockAdjustmentOnOrderUpdate(currentStock, 2, 4)
    expect(newStock).toBe(3)
  })

  it('recalcula o estoque corretamente ao editar uma reserva de aluno (diminuir quantidade)', () => {
    const currentStock = 5
    // Aluno comprou 3 e diminuiu para 1 (delta = -2, devolve 2 para o estoque)
    const newStock = calculateStockAdjustmentOnOrderUpdate(currentStock, 3, 1)
    expect(newStock).toBe(7)
  })

  it('reverte as unidades ao estoque quando um pedido é cancelado ou excluído', () => {
    const currentStock = 4
    const restoredStock = calculateStockRestoration(currentStock, 2)
    expect(restoredStock).toBe(6)
  })

  it('calcula métricas consolidadas de contagem de estoque e alertas para o admin', () => {
    const stats = computeInventoryStats(mockProducts, mockOrders)

    // Total de unidades físicas em estoque: 10 + 2 + 0 + 25 = 37
    expect(stats.totalStockUnits).toBe(37)

    // Total de reservas pendentes (status 'reserved' ou 'paid'):
    // prod-1: 2 (reserved) + 1 (paid) = 3
    // Cancelados não contam
    expect(stats.totalReservedUnits).toBe(3)

    // Alertas:
    // prod-3 está esgotado (stock: 0) -> outOfStockCount: 1
    expect(stats.outOfStockCount).toBe(1)

    // prod-2 está com estoque baixo (stock: 2 <= 3) -> lowStockCount: 1
    expect(stats.lowStockCount).toBe(1)

    // prod-1 e prod-4 têm estoque normal (> 3) -> okCount: 2
    expect(stats.okCount).toBe(2)

    // Movimentação por produto:
    expect(stats.ordersByProduct['prod-1'].reserved).toBe(3)
    expect(stats.ordersByProduct['prod-2'].delivered).toBe(1)
  })
})
