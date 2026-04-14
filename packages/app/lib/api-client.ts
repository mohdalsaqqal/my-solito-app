import { endpoints } from './endpoints'
import {
  ReferralAccountSummary,
  ReferralApplyResponse,
  ReferralLedgerEntry,
  ReferralProfile,
  ReferralProgramSettings,
  ReferralValidationResponse,
} from './referral/referral-types'
import {
  ApiResponse,
  AdminCatalogColumn,
  AdminCacheAction,
  AdminCacheAuditEntry,
  AdminCacheResult,
  AdminControlToggleUpdate,
  AdminOpsAuditEntry,
  AdminReleaseBlockRecord,
  AdminPageBlockRecord,
  AdminReleaseRecord,
  AdminBrandSpotlightRecord,
  AdminOfferBannerRecord,
  AdminMenuRecord,
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
  ReleaseBlockType,
} from './types'

export type ApiClientConfig = {
  baseUrl: string
  defaultHeaders?: HeadersInit
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

type AdminCmsTickerItem = {
  id: string
  messageEn: string
  messageAr: string
  active: boolean
}

type AdminCmsEducationBanner = {
  id: string
  titleEn: string
  titleAr: string
  bodyEn: string
  bodyAr: string
  targetPage: string
  active: boolean
}

type AdminCmsBannersState = {
  ticker: {
    items: AdminCmsTickerItem[]
    speedMs: number
  }
  educationBanners: AdminCmsEducationBanner[]
}

type AdminCmsUgcItem = {
  id: string
  imageUrl: string
  caption: string
  sourceHandle: string
  active: boolean
  order: number
}

type AdminCmsUgcState = {
  items: AdminCmsUgcItem[]
}

type AdminCmsSiteConfigState = Record<string, unknown>

export const createApiClient = (cfg: ApiClientConfig) => {
  const baseUrl = normalizeBaseUrl(cfg.baseUrl)

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(cfg.defaultHeaders)
    if (init?.headers) {
      const requestHeaders = new Headers(init.headers)
      requestHeaders.forEach((value, key) => {
        headers.set(key, value)
      })
    }

    const response = await fetch(`${baseUrl}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      ...init,
      headers,
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
      home: (previewToken?: string) => {
        const url = previewToken
          ? `${endpoints.cmsHome}?previewToken=${encodeURIComponent(previewToken)}`
          : endpoints.cmsHome
        return request<CMSHome>(url)
      },
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
      referral: () => request<ReferralAccountSummary>(endpoints.accountReferral),
      wishlist: () => request<WishlistItem[]>(endpoints.accountWishlist),
      tests: () => request<AccountTestRecord[]>(endpoints.accountTests),
      test: (id: string) => request<AccountTestDetail>(endpoints.accountTest(id)),
      qr: () => request<AccountQr>(endpoints.accountQr),
    },
    referral: {
      validate: (input: { code?: string; cartSubtotal?: number; currency?: string }) =>
        request<ReferralValidationResponse>(endpoints.referralValidate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      apply: (input: {
        code?: string
        orderId?: string
        cartSubtotal?: number
        currency?: string
      }) =>
        request<ReferralApplyResponse>(endpoints.referralApply, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
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
      getCacheSettings: () =>
        request<{ enabled: boolean; updatedAt: string; updatedBy: string }>(endpoints.adminCacheSettings),
      setCacheSettings: (input: { enabled: boolean }) =>
        request<{ enabled: boolean; updatedAt: string; updatedBy: string }>(endpoints.adminCacheSettings, {
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
      getCmsBanners: () =>
        request<AdminCmsBannersState>(endpoints.adminCmsBanners),
      updateCmsBanners: (input: AdminCmsBannersState) =>
        request<AdminCmsBannersState>(endpoints.adminCmsBanners, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      getCmsUgc: () =>
        request<AdminCmsUgcState>(endpoints.adminCmsUgc),
      updateCmsUgc: (input: AdminCmsUgcState) =>
        request<AdminCmsUgcState>(endpoints.adminCmsUgc, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      getCmsSiteConfig: () =>
        request<AdminCmsSiteConfigState>(endpoints.adminCmsSiteConfig),
      updateCmsSiteConfig: (input: Partial<AdminCmsSiteConfigState>) =>
        request<AdminCmsSiteConfigState>(endpoints.adminCmsSiteConfig, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      uploadCmsSiteConfigLogo: (locale: 'en' | 'ar', file: Blob) => {
        const formData = new FormData()
        formData.append('locale', locale)
        formData.append('file', file)
        return request<{ locale: 'en' | 'ar'; filename: string; url: string }>(
          endpoints.adminCmsSiteConfigLogoUpload,
          {
            method: 'POST',
            body: formData,
          }
        )
      },
      listOfferBanners: () =>
        request<AdminOfferBannerRecord[]>(endpoints.adminCmsOfferBanners),
      uploadOfferBannerImage: (file: Blob) => {
        const formData = new FormData()
        formData.append('file', file)
        return request<{ url: string }>(endpoints.adminCmsOfferBannersUpload, {
          method: 'POST',
          body: formData,
        })
      },
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
      uploadCmsBlockImage: (file: Blob) => {
        const formData = new FormData()
        formData.append('file', file)
        return request<{ url: string }>(endpoints.adminCmsBlocksUpload, {
          method: 'POST',
          body: formData,
        })
      },
      listMenus: () => request<AdminMenuRecord[]>(endpoints.adminCmsMenus),
      getMenu: (id: string) => request<AdminMenuRecord>(endpoints.adminCmsMenu(id)),
      createMenu: (input: {
        id: string
        name: string
        slug: string
        location: 'header_primary' | 'header_mega_categories'
        displayStyle: 'default' | 'mega_category'
        enabled?: boolean
        analytics?: {
          impressionKey?: string
          clickKey?: string
        }
        items?: Array<{
          id: string
          parentId?: string | null
          label: { en: string; ar: string }
          description?: { en: string; ar: string }
          ref: {
            sourceType: 'category' | 'query' | 'brand' | 'custom_link'
            sourceId?: string
            href?: string
          }
          order: number
          enabled: boolean
          analytics?: {
            impressionKey?: string
            clickKey?: string
          }
          featuredSlot?: {
            id: string
            type: 'banner' | 'product' | 'campaign'
            sourceId: string
            title?: { en: string; ar: string }
            subtitle?: { en: string; ar: string }
            ctaLabel?: { en: string; ar: string }
            href?: string
            imageUrl?: string
            analytics?: {
              impressionKey?: string
              clickKey?: string
            }
          }
          children?: unknown[]
        }>
        megaMenuConfig?: Array<{
          categoryItemId: string
          brandRail?:
            | {
                mode: 'static'
                title?: { en: string; ar: string }
                analytics?: {
                  impressionKey?: string
                  clickKey?: string
                }
                brands: Array<{
                  id: string
                  label: { en: string; ar: string }
                  href: string
                  analytics?: {
                    impressionKey?: string
                    clickKey?: string
                  }
                }>
              }
            | {
                mode: 'query'
                title?: { en: string; ar: string }
                analytics?: {
                  impressionKey?: string
                  clickKey?: string
                }
                queryId: string
              }
            | {
                mode: 'campaign_override'
                title?: { en: string; ar: string }
                analytics?: {
                  impressionKey?: string
                  clickKey?: string
                }
                campaignId: string
              }
        }>
      }) =>
        request<AdminMenuRecord>(endpoints.adminCmsMenus, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateMenu: (
        id: string,
        input: Partial<{
          name: string
          slug: string
          location: 'header_primary' | 'header_mega_categories'
          displayStyle: 'default' | 'mega_category'
          enabled: boolean
          analytics: {
            impressionKey?: string
            clickKey?: string
          }
          items: unknown[]
          megaMenuConfig: unknown[]
        }>
      ) =>
        request<AdminMenuRecord>(endpoints.adminCmsMenu(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      deleteMenu: (id: string) =>
        request<{ id: string; deleted: true }>(endpoints.adminCmsMenu(id), {
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
      createRelease: (input: { environment: 'staging' | 'production'; status?: 'draft' | 'published'; name?: string; scheduledAt?: string }) =>
        request<AdminReleaseRecord>(endpoints.adminReleases, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateRelease: (
        id: string,
        input: Partial<{ environment: 'staging' | 'production'; status: 'draft' | 'published'; name: string; scheduledAt: string }>
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
      rollbackRelease: (id: string) =>
        request<{ rolledBackToReleaseId: string; environment: 'staging' | 'production'; pageVersionId?: string }>(
          endpoints.adminReleaseRollback(id),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          },
        ),
      getPreviewToken: (releaseId: string, storeId: string) =>
        request<{ token: string }>(
          `${endpoints.adminPreviewToken}?releaseId=${encodeURIComponent(releaseId)}&storeId=${encodeURIComponent(storeId)}`
        ),
      listReleaseBlocks: (releaseId: string) =>
        request<AdminReleaseBlockRecord[]>(`${endpoints.adminReleaseBlocks}?releaseId=${encodeURIComponent(releaseId)}`),
      listPageBlocks: (input: {
        releaseId?: string
        storeId: string
        slug: string
        pageType?: string
      }) => {
        const params = new URLSearchParams()
        if (input.releaseId) params.set('releaseId', input.releaseId)
        params.set('storeId', input.storeId)
        params.set('slug', input.slug)
        if (input.pageType) params.set('pageType', input.pageType)
        return request<AdminPageBlockRecord[]>(`${endpoints.adminReleaseBlocks}?${params.toString()}`)
      },
      createReleaseBlock: (input: {
        releaseId: string
        position: number
        type: ReleaseBlockType
        payloadJson: unknown
        storeId?: string
        slug?: string
        pageType?: string
      }) =>
        request<AdminReleaseBlockRecord>(
          (() => {
            const params = new URLSearchParams()
            if (input.storeId) params.set('storeId', input.storeId)
            if (input.slug) params.set('slug', input.slug)
            if (input.pageType) params.set('pageType', input.pageType)
            const suffix = params.size > 0 ? `?${params.toString()}` : ''
            return `${endpoints.adminReleaseBlocks}${suffix}`
          })(),
          {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          },
        ),
      updateReleaseBlock: (
        id: string,
        input: Partial<{
          position: number
          type: ReleaseBlockType
          payloadJson: unknown
          enabled: boolean
          storeId: string
          slug: string
          pageType: string
        }>
      ) =>
        request<AdminReleaseBlockRecord>(
          (() => {
            const params = new URLSearchParams()
            if (input.storeId) params.set('storeId', input.storeId)
            if (input.slug) params.set('slug', input.slug)
            if (input.pageType) params.set('pageType', input.pageType)
            const suffix = params.size > 0 ? `?${params.toString()}` : ''
            return `${endpoints.adminReleaseBlock(id)}${suffix}`
          })(),
          {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          },
        ),
      deleteReleaseBlock: (id: string, input?: { storeId?: string; slug?: string; pageType?: string }) =>
        request<{ id: string; deleted: true }>(
          (() => {
            const params = new URLSearchParams()
            if (input?.storeId) params.set('storeId', input.storeId)
            if (input?.slug) params.set('slug', input.slug)
            if (input?.pageType) params.set('pageType', input.pageType)
            const suffix = params.size > 0 ? `?${params.toString()}` : ''
            return `${endpoints.adminReleaseBlock(id)}${suffix}`
          })(),
          {
          method: 'DELETE',
          },
        ),
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
      referralSettings: () =>
        request<ReferralProgramSettings>(endpoints.adminReferralSettings),
      updateReferralSettings: (input: Partial<ReferralProgramSettings>) =>
        request<ReferralProgramSettings>(endpoints.adminReferralSettings, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      referralProfiles: () =>
        request<ReferralProfile[]>(endpoints.adminReferralProfiles),
      createReferralProfile: (input: {
        userId: string
        displayName: string
        actorType?: ReferralProfile['actorType']
        approved?: boolean
        audienceCount?: number
      }) =>
        request<ReferralProfile>(endpoints.adminReferralProfiles, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      updateReferralProfile: (
        id: string,
        input: Partial<
          Pick<
            ReferralProfile,
            'actorType' | 'approved' | 'displayName' | 'audienceCount' | 'code' | 'shareLink'
          >
        >
      ) =>
        request<ReferralProfile>(endpoints.adminReferralProfile(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
      regenerateReferralProfile: (id: string) =>
        request<ReferralProfile>(endpoints.adminReferralProfileRegenerate(id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      referralLedger: (profileId?: string) =>
        request<ReferralLedgerEntry[]>(
          profileId
            ? `${endpoints.adminReferralLedger}?profileId=${encodeURIComponent(profileId)}`
            : endpoints.adminReferralLedger
        ),

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

      // Catalog: Product source-column mappings
      listProductColumns: () =>
        request<{ columns: AdminCatalogColumn[] }>(endpoints.adminCatalogProductColumns),
      updateProductColumns: (columns: AdminCatalogColumn[]) =>
        request<{ columns: AdminCatalogColumn[] }>(endpoints.adminCatalogProductColumns, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columns }),
        }),
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
