import type { Product } from '@/types/database'

export const STORE_SUBCATEGORIES = ['CLF', 'Sanda', 'Tai Chi', 'Equipamentos'] as const
export type StoreSubcategory = (typeof STORE_SUBCATEGORIES)[number]

/**
 * Classifica de forma inteligente e resiliente qualquer produto nas 4 subcategorias oficiais:
 * - CLF (Choy Lay Fut)
 * - Sanda (Boxe Chinês / Sparring)
 * - Tai Chi (Tai Chi Chuan)
 * - Equipamentos (Armas, proteções gerais e sacos)
 */
export function getProductSubcategory(p: { category?: string | null; name?: string }): StoreSubcategory {
  const cat = (p.category || '').toLowerCase().trim()
  const name = (p.name || '').toLowerCase()

  if (
    cat === 'sanda' ||
    name.includes('sanda') ||
    name.includes('luva') ||
    name.includes('bandagem') ||
    name.includes('boxe chinês') ||
    name.includes('caneleira')
  ) {
    return 'Sanda'
  }

  if (
    cat === 'tai chi' ||
    cat === 'taichi' ||
    cat === 'tai chi chuan' ||
    name.includes('tai chi') ||
    name.includes('taiji') ||
    name.includes('leque') ||
    name.includes('espada jian')
  ) {
    return 'Tai Chi'
  }

  if (
    cat === 'clf' ||
    cat === 'choy lay fut' ||
    cat === 'uniformes' ||
    cat === 'faixas' ||
    cat === 'vestuário' ||
    cat === 'vestuario' ||
    name.includes('clf') ||
    name.includes('choy lay fut') ||
    name.includes('faixa') ||
    name.includes('uniforme oficial') ||
    name.includes('dryfit') ||
    name.includes('camiseta')
  ) {
    return 'CLF'
  }

  return 'Equipamentos'
}

export function getSubcategoryIcon(subcategory: string): string {
  switch (subcategory) {
    case 'CLF':
      return '🥋'
    case 'Sanda':
      return '🥊'
    case 'Tai Chi':
      return '☯️'
    case 'Equipamentos':
      return '🛡️'
    default:
      return '📦'
  }
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-uniforme-clf',
    name: 'Uniforme Oficial Choy Lay Fut',
    category: 'CLF',
    price: 180.0,
    description: 'Camisa tradicional com botões chineses artesanais e calça preta ajustada com tecido reforçado.',
    stock: 15,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-faixa-bordada',
    name: 'Faixa de Graduação Bordada',
    category: 'CLF',
    price: 45.0,
    description: 'Faixa oficial de algodão puro reforçado com bordado tradicional e insígnia do Núcleo Shaolin.',
    stock: 25,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-camiseta-dryfit',
    name: 'Camiseta DryFit Núcleo Shaolin',
    category: 'CLF',
    price: 65.0,
    description: 'Camiseta de alta respirabilidade para treino físico e técnico com dragão estampado nas costas.',
    stock: 30,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-luva-sanda',
    name: 'Luva de Sanda / Boxe Chinês Profissional',
    category: 'Sanda',
    price: 140.0,
    description: 'Par de luvas reforçadas com alta absorção de impacto para treinos de combate e sparring.',
    stock: 12,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-bandagem',
    name: 'Bandagem Elástica de Proteção (Par)',
    category: 'Sanda',
    price: 35.0,
    description: 'Par de bandagens profissionais de 3 metros para firmeza e segurança dos punhos e dedos.',
    stock: 40,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-uniforme-taichi',
    name: 'Uniforme Tradicional de Tai Chi Chuan',
    category: 'Tai Chi',
    price: 190.0,
    description: 'Conjunto leve em tecido suave e respirável com botões tradicionais para prática harmônica de Tai Chi.',
    stock: 10,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-leque-taichi',
    name: 'Leque Tradicional de Tai Chi (Bambu e Seda)',
    category: 'Tai Chi',
    price: 75.0,
    description: 'Leque para treino de rotinas de Tai Chi com varetas reforçadas em bambu e estalo nítido.',
    stock: 15,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-bastao-gun',
    name: 'Bastão Tradicional de Madeira (Gun)',
    category: 'Equipamentos',
    price: 85.0,
    description: 'Bastão clássico em madeira tratada e balanceada para treino das formas clássicas de armas.',
    stock: 10,
    active: true,
    image_url: null,
    created_at: new Date().toISOString(),
  },
]
