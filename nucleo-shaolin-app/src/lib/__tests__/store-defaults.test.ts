import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PRODUCTS,
  STORE_SUBCATEGORIES,
  getProductSubcategory,
  getSubcategoryIcon,
} from '../store-defaults'

describe('store-defaults: DEFAULT_PRODUCTS e Subcategorias', () => {
  it('contains products in the catalog', () => {
    expect(DEFAULT_PRODUCTS.length).toBeGreaterThan(0)
  })

  it('every product has valid id, name, category in subcategories, price, and stock', () => {
    DEFAULT_PRODUCTS.forEach((product) => {
      expect(product.id).toMatch(/^prod-/)
      expect(product.name.trim().length).toBeGreaterThan(0)
      expect(STORE_SUBCATEGORIES).toContain(product.category)
      expect(product.price).toBeGreaterThan(0)
      expect(product.stock).toBeGreaterThanOrEqual(0)
      expect(product.active).toBe(true)
    })
  })

  it('includes key martial arts items for CLF, Sanda, Tai Chi, and Equipamentos', () => {
    const names = DEFAULT_PRODUCTS.map((p) => p.name.toLowerCase())
    expect(names.some((n) => n.includes('uniforme oficial'))).toBe(true)
    expect(names.some((n) => n.includes('faixa'))).toBe(true)
    expect(names.some((n) => n.includes('bastão'))).toBe(true)
    expect(names.some((n) => n.includes('luva'))).toBe(true)
    expect(names.some((n) => n.includes('tai chi'))).toBe(true)
  })

  it('all product IDs are strictly unique', () => {
    const ids = DEFAULT_PRODUCTS.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('getProductSubcategory accurately classifies products into CLF, Sanda, Tai Chi, and Equipamentos', () => {
    expect(getProductSubcategory({ name: 'Uniforme Choy Lay Fut', category: 'CLF' })).toBe('CLF')
    expect(getProductSubcategory({ name: 'Faixa Bordada', category: 'Faixas' })).toBe('CLF')
    expect(getProductSubcategory({ name: 'Luva de Boxe Chinês', category: 'Equipamentos' })).toBe('Sanda')
    expect(getProductSubcategory({ name: 'Bandagem de Treino', category: 'Sanda' })).toBe('Sanda')
    expect(getProductSubcategory({ name: 'Uniforme de Tai Chi Chuan', category: 'Tai Chi' })).toBe('Tai Chi')
    expect(getProductSubcategory({ name: 'Leque Tradicional', category: 'Acessórios' })).toBe('Tai Chi')
    expect(getProductSubcategory({ name: 'Bastão Tradicional Gun', category: 'Equipamentos' })).toBe('Equipamentos')
  })

  it('getSubcategoryIcon returns the correct emoji icon for each subcategory', () => {
    expect(getSubcategoryIcon('CLF')).toBe('🥋')
    expect(getSubcategoryIcon('Sanda')).toBe('🥊')
    expect(getSubcategoryIcon('Tai Chi')).toBe('☯️')
    expect(getSubcategoryIcon('Equipamentos')).toBe('🛡️')
  })
})
