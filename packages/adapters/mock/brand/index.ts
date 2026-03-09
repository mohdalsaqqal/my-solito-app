import { BrandProvider, Brand } from '@real/providers/contracts'

const brands: Brand[] = [
  {
    id: 'brand-ysl',
    slug: 'yves-saint-laurent',
    name: { en: 'Yves Saint Laurent', ar: 'إيف سان لوران' },
    logo: '/brands/ysl.png',
    isActive: true,
  },
  {
    id: 'brand-fenty',
    slug: 'fenty-beauty',
    name: { en: 'Fenty Beauty', ar: 'فينتي بيوتي' },
    logo: '/brands/fenty.png',
    isActive: true,
  },
]

export const mockBrandAdapter: BrandProvider = {
  async list() {
    return { ok: true, data: brands }
  },
  async getBySlug(slug: string) {
    const found = brands.find((item) => item.slug === slug)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'The requested brand does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
}
