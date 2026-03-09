import { AccountTestDetail, AccountTestRecord } from './AccountProvider'
import { ProviderResult } from './types'

export type PharmacistCustomerSummary = {
  userId: string
  name: string
  email: string
  phone?: string
  qrCode: string
  testCount: number
  lastTestAt?: string
}

export type PharmacistCustomerProfile = {
  customer: PharmacistCustomerSummary
  tests: AccountTestRecord[]
}

export type PharmacistConsultationMetricInput = {
  id: string
  label: string
  value: string
}

export type PharmacistConsultationInput = {
  customerId: string
  title: string
  summary: string
  notes?: string
  metrics: PharmacistConsultationMetricInput[]
  recommendedProductIds: string[]
}

export type PharmacistConsultationDraft = {
  customer: PharmacistCustomerSummary
  title: string
  summary: string
  notes?: string
  metrics: PharmacistConsultationMetricInput[]
  recommendedProducts: Array<{
    productId: string
    brand?: string
    name: string
    price: number
    currency: string
    imageUrl?: string
    inStock?: boolean
  }>
}

export interface PharmacistProvider {
  searchCustomers(query: string): Promise<ProviderResult<PharmacistCustomerSummary[]>>
  getCustomerProfile(customerId: string): Promise<ProviderResult<PharmacistCustomerProfile>>
  searchProducts(query: string): Promise<
    ProviderResult<
      Array<{
        id: string
        brand?: string
        name: string
        price: number
        currency: string
        imageUrl?: string
      }>
    >
  >
  createConsultationDraft(input: PharmacistConsultationInput): Promise<ProviderResult<PharmacistConsultationDraft>>
  resolveCustomerByQr(qrCode: string): Promise<ProviderResult<PharmacistCustomerProfile>>
  submitConsultation(input: {
    pharmacistName: string
    branchName: string
    consultation: PharmacistConsultationInput
  }): Promise<ProviderResult<AccountTestDetail>>
}
