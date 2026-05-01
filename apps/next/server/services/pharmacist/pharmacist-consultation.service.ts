import { pharmacistProvider } from '@real/providers'
import { prisma } from '../../lib/prisma'
import type {
  AuthSession,
  PharmacistConsultationInput,
  PharmacistProvider,
  ProviderResult,
} from '@real/providers/contracts'

type PharmacistConsultationPayload = {
  customerId?: unknown
  templateType?: unknown
  title?: unknown
  summary?: unknown
  notes?: unknown
  metrics?: unknown
  questionnaire?: unknown
  recommendedProductIds?: unknown
  branchName?: unknown
}

function forbidden(): ProviderResult<never> {
  return {
    ok: false,
    error: {
      code: 'AUTH_FORBIDDEN',
      message: 'Pharmacist access is required.',
    },
  }
}

function invalidQr(): ProviderResult<never> {
  return {
    ok: false,
    error: {
      code: 'PHARMACIST_QR_INVALID',
      message: 'QR code is required.',
    },
  }
}

function canUsePharmacistConsole(session: AuthSession) {
  return session.role === 'pharmacist' || session.role === 'admin'
}

function resolveBranchName(input: string | undefined): string {
  const trimmed = input?.trim()
  if (trimmed) return trimmed
  // Env override for multi-branch deployments
  if (process.env.PHARMACIST_BRANCH_NAME?.trim()) {
    return process.env.PHARMACIST_BRANCH_NAME.trim()
  }
  return 'Main Branch'
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function templateType(value: unknown): PharmacistConsultationInput['templateType'] {
  return value === 'hair' ? 'hair' : 'skin'
}

function questionnaire(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }
  return value as Record<string, unknown>
}

function normalizeConsultationPayload(payload: PharmacistConsultationPayload): PharmacistConsultationInput {
  return {
    customerId: text(payload.customerId),
    templateType: templateType(payload.templateType),
    title: text(payload.title),
    summary: text(payload.summary),
    notes: text(payload.notes),
    metrics: Array.isArray(payload.metrics) ? payload.metrics as PharmacistConsultationInput['metrics'] : [],
    questionnaire: questionnaire(payload.questionnaire),
    recommendedProductIds: Array.isArray(payload.recommendedProductIds)
      ? payload.recommendedProductIds.filter((value): value is string => typeof value === 'string')
      : [],
  }
}

export async function searchPharmacistCustomers(
  session: AuthSession,
  query: string,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  return provider.searchCustomers(query)
}

export async function getPharmacistCustomerProfile(
  session: AuthSession,
  customerId: string,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  return provider.getCustomerProfile(customerId)
}

export async function searchPharmacistProducts(
  session: AuthSession,
  query: string,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  return provider.searchProducts(query)
}

export async function createPharmacistConsultationDraft(
  session: AuthSession,
  payload: PharmacistConsultationPayload,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  return provider.createConsultationDraft(normalizeConsultationPayload(payload))
}

export async function resolvePharmacistCustomerByQr(
  session: AuthSession,
  qrCode: string,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  const normalizedQrCode = qrCode.trim()
  if (!normalizedQrCode) {
    return invalidQr()
  }

  return provider.resolveCustomerByQr(normalizedQrCode)
}

export async function submitPharmacistConsultation(
  session: AuthSession,
  payload: PharmacistConsultationPayload,
  provider: PharmacistProvider = pharmacistProvider,
) {
  if (!canUsePharmacistConsole(session)) {
    return forbidden()
  }

  const consultation = normalizeConsultationPayload(payload)
  const branchName = resolveBranchName(payload.branchName as string | undefined)
  const pharmacistName = session.name

  // Persist to Prisma (production storage)
  let prismaId: string | null = null
  try {
    const record = await prisma.pharmacistConsultation.create({
      data: {
        customerId: consultation.customerId,
        pharmacistId: session.userId,
        pharmacistName,
        branchName,
        templateType: consultation.templateType,
        title: consultation.title,
        summary: consultation.summary,
        notes: consultation.notes,
        metricsJson: consultation.metrics,
        questionnaireJson: (consultation.questionnaire ?? undefined) as never,
        recommendedProductIds: consultation.recommendedProductIds,
        status: 'submitted',
      },
    })
    prismaId = record.id
  } catch (error) {
    console.error('[pharmacist] Failed to persist consultation to Prisma', error)
  }

  // Submit via provider (mock or real backend)
  const result = await provider.submitConsultation({
    pharmacistName,
    branchName,
    consultation,
  })

  // Trigger notification to customer
  if (result.ok) {
    try {
      const { notificationProvider } = await import('@real/providers')
      await notificationProvider.sendOrderStatusUpdate({
        userId: consultation.customerId,
        tenantId: 'default',
        orderId: `consultation-${prismaId ?? result.data?.id ?? ''}`,
        status: 'pharmacist_result_ready',
      })
    } catch (error) {
      console.error('[pharmacist] Failed to send notification', error)
    }
  }

  return result
}
