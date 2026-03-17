import { endpoints } from './endpoints'
import {
  ApiResponse,
  AdminCacheAction,
  AdminCacheAuditEntry,
  AdminCacheResult,
  AdminControlToggleUpdate,
  AdminOpsAuditEntry,
  AdminReleaseBlockRecord,
  AdminReleaseRecord,
  AdminBrandSpotlightRecord,
  AdminOfferBannerRecord,
  AdminUserControlRecord,
  AuthAck,
  AuthSession,
  CMSHome,
  Cart,
  AccountAddress,
  AccountQr,
  AccountTestDetail,
  AccountOverview,
  AccountTestRecord,
  PharmacistConsultationDraft,
  PharmacistConsultationInput,
  PharmacistCustomerProfile,
  PharmacistCustomerSummary,
  LoyaltyHistoryEntry,
  LoyaltyWallet,
  OrderSummary,
  CheckoutPlaceOrderInput,
  Product,
  Review,
  OrderStatus,
  SearchResult,
  WishlistItem,
  ProductFilter,
  ProductQuery,
  Promotion,
  TranslationPrefillResult,
  TranslationStatus,
  LocalizedString,
  CheckoutQuoteInput,
  CheckoutQuoteResponse,
  AdminFieldRegistry,
  AdminPagedResponse,
  ProductRow,
  OrderRow,
  InventoryRow,
  VendorRow,
  AdminSavedView,
  AdminListInput,
  CommerceCapabilities,
  ProductDetail,
  ProductUpsertInput,
  ProductActionInput,
  OrderDetail,
  OrderUpdateInput,
  OrderActionInput,
  InventoryDetail,
  InventoryUpdateInput,
  InventoryActionInput,
  VendorDetail,
  VendorUpdateInput,
  VendorActionInput,
  AdminJobRecord,
  AdminJobCreateInput,
  AdminCategoryRecord,
  AdminBrandRecord,
} from './types'

export type ApiClientConfig = {
  baseUrl: string
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const createApiClient = (cfg: ApiClientConfig) => {
  const baseUrl = normalizeBaseUrl(cfg.baseUrl)

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      ...init,
    })
    let json: ApiResponse<T> | null = null
    try {
      json = (await response.json()) as ApiResponse<T>
    } catch {
      json = null
    }

    if (!response.ok) {
      if (json && !json.success) {
        throw new Error(`[${path}] ${json.error.code}: ${json.error.message}`)
      }
      throw new Error(`[${path}] Request failed (${response.status})`)
    }

    if (!json) {
      throw new Error(`[${path}] Invalid API response`)
    }
    if (!json.success) {
      throw new Error(`[${path}] ${json.error.code}: ${json.error.message}`)
    }

    return json.data
  }

  return {
    products: {
      list: (filters?: ProductFilter) => {
        const params = new URLSearchParams()
        if (filters?.brand?.length) params.set('brand', filters.brand.join(','))
        if (filters?.category?.length) params.set('category', filters.category.join(','))
        if (filters?.ids?.length) params.set('ids', filters.ids.join(','))
        if (filters?.onSale) params.set('onSale', '1')
        if (filters?.sort) params.set('sort', filters.sort)
        if (typeof filters?.limit === 'number') params.set('limit', String(filters.limit))
        return request<Product[]>(endpoints.productsFiltered(params.toString()))
      },
      get: (id: string) => request<Product>(endpoints.product(id)),
    },
    catalog: {
      categories: () =>
        request<
          Array<{
            id: string
            slug: string
            name: LocalizedString
            parentId?: string
            image?: string
            isActive: boolean
            sortOrder: number
          }>
        >(endpoints.categories),
      categoryTree: () =>
        request<
          Array<{
            id: string
            slug: string
            name: LocalizedString
            parentId?: string
            image?: string
            isActive: boolean
            sortOrder: number
            children: Array<unknown>
          }>
        >(endpoints.categoryTree),
      category: (slug: string) => request(endpoints.category(slug)),
      brands: () =>
        request<
          Array<{
            id: string
            slug: string
            name: LocalizedString
            logo?: string
            description?: LocalizedString
            isActive: boolean
          }>
        >(endpoints.brands),
      brand: (slug: string) => request(endpoints.brand(slug)),
      productQueries: () => request<ProductQuery[]>(endpoints.productQueries),
      productQuery: (slug: string) => request<ProductQuery>(endpoints.productQuery(slug)),
    },
    search: {
      query: (value: string) => request<SearchResult>(endpoints.search(value)),
    },
    cart: {
      get: () => request<Cart>(endpoints.cart),
      add: (productId: string, quantity: number) =>
        request<Cart>(endpoints.cartAdd, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        }),
      remove: (productId: string) =>
        request<Cart>(endpoints.cartRemove, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }),
      setQuantity: (productId: string, quantity: number) =>
        request<Cart>(endpoints.cartSetQuantity, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        }),
    },
    checkout: {
      quote: (input: CheckoutQuoteInput) =>
        request<CheckoutQuoteResponse>(endpoints.checkoutQuote, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
    },
    orders: {
      list: () => request<OrderSummary[]>(endpoints.orders),
      get: (id: string) => request<OrderSummary>(endpoints.order(id)),
      place: (input: CheckoutPlaceOrderInput) =>
        request<OrderSummary>(endpoints.orderPlace, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
    },
    reviews: {
      list: (productId: string) => request<Review[]>(endpoints.reviews(productId)),
      create: (input: {
        productId: string
        rating: number
        title: string
        body: string
        author: string
      }) =>
        request<Review>(endpoints.reviewCreate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
    },
    cms: {
      home: () => request<CMSHome>(endpoints.cmsHome),
    },
    auth: {
      session: () => request<AuthSession | null>(endpoints.authSession),
      login: (input: { email: string; password: string }) =>
        request<AuthSession>(endpoints.authLogin, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      register: (input: { name: string; email: string; password: string }) =>
        request<AuthSession>(endpoints.authRegister, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      logout: () =>
        request<AuthAck>(endpoints.authLogout, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      requestReset: (input: { email: string }) =>
        request<AuthAck>(endpoints.authRequestReset, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      resetPassword: (input: { token: string; newPassword: string }) =>
        request<AuthAck>(endpoints.authResetPassword, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
    },
    account: {
      overview: () => request<AccountOverview>(endpoints.accountOverview),
      addresses: () => request<AccountAddress[]>(endpoints.accountAddresses),
      createAddress: (input: {
        label: string
        city: string
        area: string
        building: string
        floor?: string
        apartment?: string
      }) =>
        request<AccountAddress[]>(endpoints.accountAddresses, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateAddress: (
        id: string,
        input: {
          label?: string
          city?: string
          area?: string
          building?: string
          floor?: string
          apartment?: string
        }
      ) =>
        request<AccountAddress[]>(endpoints.accountAddress(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteAddress: (id: string) =>
        request<AccountAddress[]>(endpoints.accountAddress(id), {
          method: 'DELETE',
        }),
      setDefaultAddress: (id: string) =>
        request<AccountAddress[]>(endpoints.accountAddressSetDefault(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      loyalty: () =>
        request<{
          summary: AccountOverview['loyaltySummary']
          wallet: LoyaltyWallet | null
          history: LoyaltyHistoryEntry[]
        }>(endpoints.accountLoyalty),
      wishlist: () => request<WishlistItem[]>(endpoints.accountWishlist),
      tests: () => request<AccountTestRecord[]>(endpoints.accountTests),
      test: (id: string) => request<AccountTestDetail>(endpoints.accountTest(id)),
      qr: () => request<AccountQr>(endpoints.accountQr),
    },
    admin: {
      listProducts: (input: AdminListInput) => {
        const params = new URLSearchParams()
        params.set('limit', String(input.limit || 25))
        if (input.cursor) params.set('cursor', input.cursor)
        if (input.search) params.set('search', input.search)
        if (input.sort?.key) params.set('sortKey', input.sort.key)
        if (input.sort?.direction) params.set('sortDir', input.sort.direction)
        if (input.fields?.length) params.set('fields', input.fields.join(','))
        if (input.filters && Object.keys(input.filters).length > 0) {
          params.set('filters', JSON.stringify(input.filters))
        }
        if (input.viewId) params.set('viewId', input.viewId)
        return request<AdminPagedResponse<ProductRow>>(
          `${endpoints.adminProducts}?${params.toString()}`
        )
      },
      getProduct: (id: string) => request<ProductDetail>(endpoints.adminProduct(id)),
      createProduct: (input: ProductUpsertInput) =>
        request<ProductDetail>(endpoints.adminProductCreate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateProduct: (id: string, input: Partial<ProductUpsertInput>) =>
        request<ProductDetail>(endpoints.adminProduct(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      runProductAction: (id: string, input: ProductActionInput) =>
        request<ProductDetail>(endpoints.adminProductAction(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      listOrdersPaged: (input: AdminListInput) => {
        const params = new URLSearchParams()
        params.set('limit', String(input.limit || 25))
        if (input.cursor) params.set('cursor', input.cursor)
        if (input.search) params.set('search', input.search)
        if (input.sort?.key) params.set('sortKey', input.sort.key)
        if (input.sort?.direction) params.set('sortDir', input.sort.direction)
        if (input.fields?.length) params.set('fields', input.fields.join(','))
        if (input.filters && Object.keys(input.filters).length > 0) {
          params.set('filters', JSON.stringify(input.filters))
        }
        if (input.viewId) params.set('viewId', input.viewId)
        return request<AdminPagedResponse<OrderRow>>(`${endpoints.adminOrders}?${params.toString()}`)
      },
      getOrder: (id: string) => request<OrderDetail>(endpoints.adminOrder(id)),
      updateOrder: (id: string, input: Partial<OrderUpdateInput>) =>
        request<OrderDetail>(endpoints.adminOrder(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      runOrderAction: (id: string, input: OrderActionInput) =>
        request<OrderDetail>(endpoints.adminOrderAction(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      listInventory: (input: AdminListInput) => {
        const params = new URLSearchParams()
        params.set('limit', String(input.limit || 25))
        if (input.cursor) params.set('cursor', input.cursor)
        if (input.search) params.set('search', input.search)
        if (input.sort?.key) params.set('sortKey', input.sort.key)
        if (input.sort?.direction) params.set('sortDir', input.sort.direction)
        if (input.fields?.length) params.set('fields', input.fields.join(','))
        if (input.filters && Object.keys(input.filters).length > 0) {
          params.set('filters', JSON.stringify(input.filters))
        }
        if (input.viewId) params.set('viewId', input.viewId)
        return request<AdminPagedResponse<InventoryRow>>(
          `${endpoints.adminInventory}?${params.toString()}`
        )
      },
      getInventory: (id: string) => request<InventoryDetail>(endpoints.adminInventoryItem(id)),
      updateInventory: (id: string, input: Partial<InventoryUpdateInput>) =>
        request<InventoryDetail>(endpoints.adminInventoryItem(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      runInventoryAction: (id: string, input: InventoryActionInput) =>
        request<InventoryDetail>(endpoints.adminInventoryAction(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      listVendors: (input: AdminListInput) => {
        const params = new URLSearchParams()
        params.set('limit', String(input.limit || 25))
        if (input.cursor) params.set('cursor', input.cursor)
        if (input.search) params.set('search', input.search)
        if (input.sort?.key) params.set('sortKey', input.sort.key)
        if (input.sort?.direction) params.set('sortDir', input.sort.direction)
        if (input.fields?.length) params.set('fields', input.fields.join(','))
        if (input.filters && Object.keys(input.filters).length > 0) {
          params.set('filters', JSON.stringify(input.filters))
        }
        if (input.viewId) params.set('viewId', input.viewId)
        return request<AdminPagedResponse<VendorRow>>(`${endpoints.adminVendors}?${params.toString()}`)
      },
      getVendor: (id: string) => request<VendorDetail>(endpoints.adminVendor(id)),
      updateVendor: (id: string, input: Partial<VendorUpdateInput>) =>
        request<VendorDetail>(endpoints.adminVendor(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      runVendorAction: (id: string, input: VendorActionInput) =>
        request<VendorDetail>(endpoints.adminVendorAction(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      productFields: () => request<AdminFieldRegistry>(endpoints.adminProductFields),
      orderFields: () => request<AdminFieldRegistry>(endpoints.adminOrderFields),
      inventoryFields: () => request<AdminFieldRegistry>(endpoints.adminInventoryFields),
      vendorFields: () => request<AdminFieldRegistry>(endpoints.adminVendorFields),
      capabilities: () => request<CommerceCapabilities>(endpoints.adminCapabilities),
      listJobs: () => request<AdminJobRecord[]>(endpoints.adminJobs),
      getJob: (id: string) => request<AdminJobRecord>(endpoints.adminJob(id)),
      createJob: (input: AdminJobCreateInput) =>
        request<AdminJobRecord>(endpoints.adminJobs, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      listSavedViews: (entity?: AdminSavedView['entity']) =>
        request<AdminSavedView[]>(
          entity ? `${endpoints.adminSavedViews}?entity=${encodeURIComponent(entity)}` : endpoints.adminSavedViews
        ),
      upsertSavedView: (view: AdminSavedView) =>
        request<AdminSavedView>(endpoints.adminSavedViews, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ view }),
        }),
      deleteSavedViewById: (id: string) =>
        request<{ id: string; deleted: true }>(
          `${endpoints.adminSavedViews}?id=${encodeURIComponent(id)}`,
          {
            method: 'DELETE',
          }
        ),
      updateOrderStatus: (id: string, status: OrderStatus) =>
        request<OrderSummary>(endpoints.adminOrderStatus(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }),
      cacheAudit: () => request<AdminCacheAuditEntry[]>(endpoints.adminCache),
      runCacheAction: (input: { action: AdminCacheAction; confirmation: string }) =>
        request<AdminCacheResult>(endpoints.adminCache, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      listCmsToggles: () => request<AdminControlToggleUpdate[]>(endpoints.adminCmsToggles),
      updateCmsToggle: (id: string, enabled: boolean) =>
        request<AdminControlToggleUpdate>(endpoints.adminCmsToggle(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        }),
      listBrandSpotlights: () =>
        request<AdminBrandSpotlightRecord[]>(endpoints.adminCmsBrandSpotlights),
      createBrandSpotlight: (input: {
        id?: string
        enabled?: boolean
        bannerTitle: { en: string; ar: string }
        bannerSubtitle?: { en: string; ar: string }
        bannerCtaLabel?: { en: string; ar: string }
        bannerHref?: string
        bannerImageUrl?: string
        railTitle: { en: string; ar: string }
        query?: {
          source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
          limit?: number
          sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
          productIds?: string[]
          brandNames?: string[]
        }
      }) =>
        request<AdminBrandSpotlightRecord>(endpoints.adminCmsBrandSpotlights, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateBrandSpotlight: (
        id: string,
        input: {
          enabled?: boolean
          bannerTitle?: { en: string; ar: string }
          bannerSubtitle?: { en: string; ar: string }
          bannerCtaLabel?: { en: string; ar: string }
          bannerHref?: string
          bannerImageUrl?: string
          railTitle?: { en: string; ar: string }
          query?: {
            source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
            limit?: number
            sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
            productIds?: string[]
            brandNames?: string[]
          }
          position?: number
        }
      ) =>
        request<AdminBrandSpotlightRecord>(endpoints.adminCmsBrandSpotlight(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteBrandSpotlight: (id: string) =>
        request<{ id: string; deleted: true }>(endpoints.adminCmsBrandSpotlight(id), {
          method: 'DELETE',
        }),
      listOfferBanners: () =>
        request<AdminOfferBannerRecord[]>(endpoints.adminCmsOfferBanners),
      createOfferBanner: (input: {
        id?: string
        enabled?: boolean
        imageUrl?: string
        href?: string
        ctaLabel?: { en: string; ar: string }
      }) =>
        request<AdminOfferBannerRecord>(endpoints.adminCmsOfferBanners, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateOfferBanner: (
        id: string,
        input: {
          enabled?: boolean
          imageUrl?: string
          href?: string
          ctaLabel?: { en: string; ar: string }
          position?: number
        }
      ) =>
        request<AdminOfferBannerRecord>(endpoints.adminCmsOfferBanner(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteOfferBanner: (id: string) =>
        request<{ id: string; deleted: true }>(endpoints.adminCmsOfferBanner(id), {
          method: 'DELETE',
        }),
      listUsers: () => request<AdminUserControlRecord[]>(endpoints.adminUsers),
      updateUser: (
        id: string,
        input: {
          role?: AdminUserControlRecord['role']
          status?: AdminUserControlRecord['status']
          permissions?: Partial<NonNullable<AdminUserControlRecord['permissions']>>
        }
      ) =>
        request<AdminUserControlRecord>(endpoints.adminUser(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      opsAudit: (input?: { actor?: string; type?: string }) => {
        const params = new URLSearchParams()
        if (input?.actor) params.set('actor', input.actor)
        if (input?.type) params.set('type', input.type)
        const suffix = params.size > 0 ? `?${params.toString()}` : ''
        return request<AdminOpsAuditEntry[]>(`${endpoints.adminOpsAudit}${suffix}`)
      },
      exportOpsAudit: (input?: { actor?: string; type?: string }) => {
        const params = new URLSearchParams()
        if (input?.actor) params.set('actor', input.actor)
        if (input?.type) params.set('type', input.type)
        const suffix = params.size > 0 ? `?${params.toString()}` : ''
        return request<{ exportedAt: string; count: number; entries: AdminOpsAuditEntry[] }>(
          `${endpoints.adminOpsAuditExport}${suffix}`
        )
      },
      i18nStatus: () => request<TranslationStatus>(endpoints.adminI18nStatus),
      i18nPrefill: (input?: { dryRun?: boolean }) =>
        request<TranslationPrefillResult>(endpoints.adminI18nPrefill, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input ?? {}),
        }),
      listReleases: () => request<AdminReleaseRecord[]>(endpoints.adminReleases),
      createRelease: (input: { environment: 'staging' | 'production'; status?: 'draft' | 'published' }) =>
        request<AdminReleaseRecord>(endpoints.adminReleases, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateRelease: (
        id: string,
        input: Partial<{ environment: 'staging' | 'production'; status: 'draft' | 'published' }>
      ) =>
        request<AdminReleaseRecord>(endpoints.adminRelease(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      publishRelease: (id: string) =>
        request<AdminReleaseRecord>(endpoints.adminReleasePublish(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      listReleaseBlocks: (releaseId: string) =>
        request<AdminReleaseBlockRecord[]>(`${endpoints.adminReleaseBlocks}?releaseId=${encodeURIComponent(releaseId)}`),
      createReleaseBlock: (input: {
        releaseId: string
        position: number
        type: 'hero' | 'product_slider' | 'brand_promo' | 'promo_strip'
        payloadJson: unknown
      }) =>
        request<AdminReleaseBlockRecord>(endpoints.adminReleaseBlocks, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateReleaseBlock: (
        id: string,
        input: Partial<{ position: number; type: 'hero' | 'product_slider' | 'brand_promo' | 'promo_strip'; payloadJson: unknown }>
      ) =>
        request<AdminReleaseBlockRecord>(endpoints.adminReleaseBlock(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteReleaseBlock: (id: string) =>
        request<{ id: string; deleted: true }>(endpoints.adminReleaseBlock(id), {
          method: 'DELETE',
        }),
      getProductColumns: () =>
        request<{
          columns: Array<{
            id: string
            label: string
            path: string
            mode: 'custom' | 'source'
          }>
        }>(endpoints.adminCatalogProductColumns),
      setProductColumns: (
        columns: Array<{
          id: string
          label: string
          path: string
          mode: 'custom' | 'source'
        }>
      ) =>
        request<{
          columns: Array<{
            id: string
            label: string
            path: string
            mode: 'custom' | 'source'
          }>
        }>(endpoints.adminCatalogProductColumns, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columns }),
        }),
      listProductQueries: () => request<ProductQuery[]>(endpoints.adminProductQueries),
      createProductQuery: (input: {
        slug: string
        active?: boolean
        title?: LocalizedString
        filters?: ProductFilter
      }) =>
        request<ProductQuery>(endpoints.adminProductQueries, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateProductQuery: (
        slug: string,
        input: Partial<{ active: boolean; title: LocalizedString; filters: ProductFilter }>
      ) =>
        request<ProductQuery>(endpoints.adminProductQuery(slug), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteProductQuery: (slug: string) =>
        request<{ slug: string; deleted: true }>(endpoints.adminProductQuery(slug), {
          method: 'DELETE',
        }),
      listPromotions: () => request<Promotion[]>(endpoints.adminPromotions),
      createPromotion: (input: Promotion) =>
        request<Promotion>(endpoints.adminPromotions, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updatePromotion: (
        id: string,
        input: Partial<{
          code?: string
          name: Promotion['name']
          isActive: boolean
          startAt: string
          endAt: string
          priority: number
          conditions: Promotion['conditions']
          rewards: Promotion['rewards']
        }>
      ) =>
        request<Promotion>(endpoints.adminPromotion(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deletePromotion: (id: string) =>
        request<{ id: string; deleted: true }>(endpoints.adminPromotion(id), {
          method: 'DELETE',
        }),

      // Catalog: Categories
      listCategories: () =>
        request<{ categories: AdminCategoryRecord[] }>(endpoints.adminCategories),
      createCategory: (input: Partial<AdminCategoryRecord>) =>
        request<{ category: AdminCategoryRecord }>(endpoints.adminCategories, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateCategory: (id: string, input: Partial<AdminCategoryRecord>) =>
        request<{ category: AdminCategoryRecord }>(endpoints.adminCategory(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteCategory: (id: string) =>
        request<{ deleted: boolean }>(endpoints.adminCategory(id), { method: 'DELETE' }),
      syncCategories: () =>
        request<{ synced: { created: number; updated: number } }>(endpoints.adminCategoriesSync, { method: 'POST' }),

      // Catalog: Brands (admin write)
      listBrandsAdmin: () =>
        request<{ brands: AdminBrandRecord[] }>(endpoints.adminBrandsAdmin),
      createBrand: (input: Partial<AdminBrandRecord>) =>
        request<{ brand: AdminBrandRecord }>(endpoints.adminBrandsAdmin, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateBrand: (id: string, input: Partial<AdminBrandRecord>) =>
        request<{ brand: AdminBrandRecord }>(endpoints.adminBrandAdmin(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteBrand: (id: string) =>
        request<{ deleted: boolean }>(endpoints.adminBrandAdmin(id), { method: 'DELETE' }),
      syncBrands: () =>
        request<{ synced: { created: number; updated: number } }>(endpoints.adminBrandsAdminSync, { method: 'POST' }),
    },
    pharmacist: {
      searchCustomers: (query: string) =>
        request<PharmacistCustomerSummary[]>(endpoints.pharmacistCustomersSearch(query)),
      getCustomer: (id: string) => request<PharmacistCustomerProfile>(endpoints.pharmacistCustomer(id)),
      searchProducts: (query: string) =>
        request<AccountTestDetail['recommendedProducts']>(
          endpoints.pharmacistProductsSearch(query)
        ),
      createDraft: (input: PharmacistConsultationInput) =>
        request<PharmacistConsultationDraft>(endpoints.pharmacistConsultationDraft, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      resolveQr: (qrCode: string) =>
        request<PharmacistCustomerProfile>(endpoints.pharmacistResolveQr, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCode }),
        }),
      submit: (input: PharmacistConsultationInput) =>
        request<AccountTestDetail>(endpoints.pharmacistConsultationSubmit, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
    },
  }
}
