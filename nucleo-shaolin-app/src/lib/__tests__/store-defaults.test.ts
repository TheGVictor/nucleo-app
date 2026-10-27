import { describe, it, expect } from 'vitest'
import { DEFAULT_PRODUCTS } from '../store-defaults'

describe('store-defaults: DEFAULT_PRODUCTS', () => {
  it('contains products in the catalog', () => {
    expect(DEFAULT_PRODUCTS.length).toBeGreaterThan(0)
  })

  it('every product has valid id, name, category, price, and stock', () => {
    const validCategories = ['Uniformes', 'Faixas', 'Vestuário', 'Equipamentos']

    DEFAULT_PRODUCTS.forEach((product) => {
      expect(product.id).toMatch(/^prod-/)
      expect(product.name.trim().length).toBeGreaterThan(0)
      expect(validCategories).toContain(product.category)
      expect(product.price).toBeGreaterThan(0)
      expect(product.stock).toBeGreaterThanOrEqual(0)
      expect(product.active).toBe(true)
    })
  })

  it('includes key martial arts items: Choy Lay Fut uniform, belt, gun (staff), and boxing gloves', () => {
    const names = DEFAULT_PRODUCTS.map((p) => p.name.toLowerCase())
    expect(names.some((n) => n.includes('uniforme oficial'))).toBe(true)
    expect(names.some((n) => n.includes('faixa'))).toBe(true)
    expect(names.some((n) => n.includes('bastão'))).toBe(true)
    expect(names.some((n) => n.includes('luva'))).toBe(true)
  })

  it('all product IDs are strictly unique', () => {
    const ids = DEFAULT_PRODUCTS.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
