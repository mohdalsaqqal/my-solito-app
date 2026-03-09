import { CategoryProvider, Category, CategoryTreeNode } from '@real/providers/contracts'

const categories: Category[] = [
  {
    id: 'cat-makeup',
    slug: 'makeup',
    name: { en: 'Makeup', ar: 'المكياج' },
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'cat-skincare',
    slug: 'skincare',
    name: { en: 'Skincare', ar: 'العناية بالبشرة' },
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'cat-lips',
    slug: 'lips',
    name: { en: 'Lips', ar: 'الشفاه' },
    parentId: 'cat-makeup',
    isActive: true,
    sortOrder: 10,
  },
]

function buildTree(list: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []
  for (const item of list) {
    map.set(item.id, { ...item, children: [] })
  }
  for (const item of list) {
    const node = map.get(item.id)
    if (!node) continue
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    for (const node of nodes) sortNodes(node.children)
  }
  sortNodes(roots)
  return roots
}

let cachedTree: CategoryTreeNode[] | null = null

export const mockCategoryAdapter: CategoryProvider = {
  async list() {
    return {
      ok: true,
      data: [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    }
  },
  async tree() {
    if (!cachedTree) {
      cachedTree = buildTree(categories)
    }
    return { ok: true, data: cachedTree }
  },
  async getBySlug(slug: string) {
    const found = categories.find((item) => item.slug === slug)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'The requested category does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
}
