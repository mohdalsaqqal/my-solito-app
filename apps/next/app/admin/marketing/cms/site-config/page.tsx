'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Save } from 'lucide-react'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  AdminFormScaffold,
  Button,
  Field,
  PageContainer,
  Section,
  TextInput,
} from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'
import { apiClient } from '../../../../apiClient'

type LogoSizeKey = 'sm' | 'md' | 'lg'
type LocaleKey = 'en' | 'ar'

interface SiteConfigState {
  branding: {
    en: {
      logoUrl: string
      logoAlt: string
      logoSize: LogoSizeKey
    }
    ar: {
      logoUrl: string
      logoAlt: string
      logoSize: LogoSizeKey
    }
  }
  topBar: {
    messageEn: string
    messageAr: string
    ctaLabelEn: string
    ctaLabelAr: string
    ctaHref: string
  }
  footer: {
    newsletterTitleEn: string
    newsletterTitleAr: string
    legalEn: string
    legalAr: string
  }
  search: {
    panelTitleEn: string
    panelTitleAr: string
  }
}

const LOGO_SIZE_OPTIONS: Array<{ value: LogoSizeKey; label: string; width: number }> = [
  { value: 'sm', label: 'sm', width: 88 },
  { value: 'md', label: 'md', width: 128 },
  { value: 'lg', label: 'lg', width: 168 },
]

function emptyBrandingLocale(locale: LocaleKey): SiteConfigState['branding'][LocaleKey] {
  return {
    logoUrl: '',
    logoAlt: locale === 'ar' ? 'ريال كوزمتكس' : 'Real Cosmetics',
    logoSize: 'md',
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyConfig(): SiteConfigState {
  return {
    branding: {
      en: emptyBrandingLocale('en'),
      ar: emptyBrandingLocale('ar'),
    },
    topBar: { messageEn: '', messageAr: '', ctaLabelEn: '', ctaLabelAr: '', ctaHref: '' },
    footer: { newsletterTitleEn: '', newsletterTitleAr: '', legalEn: '', legalAr: '' },
    search: { panelTitleEn: '', panelTitleAr: '' },
  }
}

function normalizeConfig(config: Partial<SiteConfigState> | null | undefined): SiteConfigState {
  const fallback = emptyConfig()
  if (!config) {
    return fallback
  }

  return {
    branding: {
      en: {
        logoUrl: config.branding?.en?.logoUrl ?? fallback.branding.en.logoUrl,
        logoAlt: config.branding?.en?.logoAlt ?? fallback.branding.en.logoAlt,
        logoSize: config.branding?.en?.logoSize ?? fallback.branding.en.logoSize,
      },
      ar: {
        logoUrl: config.branding?.ar?.logoUrl ?? fallback.branding.ar.logoUrl,
        logoAlt: config.branding?.ar?.logoAlt ?? fallback.branding.ar.logoAlt,
        logoSize: config.branding?.ar?.logoSize ?? fallback.branding.ar.logoSize,
      },
    },
    topBar: {
      messageEn: config.topBar?.messageEn ?? fallback.topBar.messageEn,
      messageAr: config.topBar?.messageAr ?? fallback.topBar.messageAr,
      ctaLabelEn: config.topBar?.ctaLabelEn ?? fallback.topBar.ctaLabelEn,
      ctaLabelAr: config.topBar?.ctaLabelAr ?? fallback.topBar.ctaLabelAr,
      ctaHref: config.topBar?.ctaHref ?? fallback.topBar.ctaHref,
    },
    footer: {
      newsletterTitleEn: config.footer?.newsletterTitleEn ?? fallback.footer.newsletterTitleEn,
      newsletterTitleAr: config.footer?.newsletterTitleAr ?? fallback.footer.newsletterTitleAr,
      legalEn: config.footer?.legalEn ?? fallback.footer.legalEn,
      legalAr: config.footer?.legalAr ?? fallback.footer.legalAr,
    },
    search: {
      panelTitleEn: config.search?.panelTitleEn ?? fallback.search.panelTitleEn,
      panelTitleAr: config.search?.panelTitleAr ?? fallback.search.panelTitleAr,
    },
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LocalizedPair({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
}: {
  labelEn: string
  labelAr: string
  valueEn: string
  valueAr: string
  onChangeEn: (v: string) => void
  onChangeAr: (v: string) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
      <Field label={labelEn}>
        <TextInput value={valueEn} onChange={(e) => onChangeEn(e.target.value)} />
      </Field>
      <Field label={labelAr}>
        <TextInput
          value={valueAr}
          onChange={(e) => onChangeAr(e.target.value)}
          dir="rtl"
          lang="ar"
        />
      </Field>
    </div>
  )
}

function SingleField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Field label={label}>
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <AdminFormScaffold title={title}>
      {children}
    </AdminFormScaffold>
  )
}

function BrandingLocaleCard({
  locale,
  label,
  branding,
  onChange,
  onUploadClick,
  onUploadFile,
  uploading,
  inputRef,
}: {
  locale: LocaleKey
  label: string
  branding: SiteConfigState['branding'][LocaleKey]
  onChange: (patch: Partial<SiteConfigState['branding'][LocaleKey]>) => void
  onUploadClick: () => void
  onUploadFile: (file: File) => Promise<void>
  uploading: boolean
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const selectedSize = LOGO_SIZE_OPTIONS.find((item) => item.value === branding.logoSize) ?? LOGO_SIZE_OPTIONS[1]

  return (
    <div
      style={{
        display: 'grid',
        gap: spacing['16'],
        padding: spacing['16'],
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
      }}
    >
      <div style={{ display: 'grid', gap: spacing['4'] }}>
        <span
          style={{
            color: colors.textPrimary,
            fontSize: typography.lg,
            fontWeight: Number(fontWeights.semibold),
          }}
        >
          {label}
        </span>
        <span style={{ color: colors.textSecondary, fontSize: typography.caption }}>
          Upload a locale-specific logo and set how large it appears in the header.
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gap: spacing['12'],
          gridTemplateColumns: locale === 'ar' ? '1fr' : '1fr',
        }}
      >
        <div
          style={{
            minHeight: 96,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            backgroundColor: colors.backgroundSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing['12'],
            overflow: 'hidden',
          }}
        >
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.logoAlt}
              style={{
                display: 'block',
                width: selectedSize.width,
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          ) : (
            <span style={{ color: colors.textSecondary, fontSize: typography.caption }}>
              No logo uploaded yet
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing['8'], alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ''
              if (!file) return
              await onUploadFile(file)
            }}
            style={{ display: 'none' }}
          />
          <Button type="button" tone="primary" onClick={onUploadClick} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Choose logo'}
          </Button>
          <span style={{ color: colors.textSecondary, fontSize: typography.caption }}>
            JPG, PNG, WebP or SVG
          </span>
        </div>

        <Field label={`${label} alt text`}>
          <TextInput
            value={branding.logoAlt}
            onChange={(e) => onChange({ logoAlt: e.target.value })}
            placeholder={locale === 'ar' ? 'شعار ريال كوزمتكس' : 'Real Cosmetics logo'}
          />
        </Field>

        <Field label={`${label} logo size`}>
          <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
            {LOGO_SIZE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                tone={branding.logoSize === option.value ? 'primary' : 'secondary'}
                onClick={() => onChange({ logoSize: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminCmsSiteConfigPage() {
  const [config, setConfig] = useState<SiteConfigState>(emptyConfig())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadingLocale, setUploadingLocale] = useState<LocaleKey | null>(null)
  const uploadRefs = {
    en: useRef<HTMLInputElement | null>(null),
    ar: useRef<HTMLInputElement | null>(null),
  }

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const nextConfig = await apiClient.admin.getCmsSiteConfig()
      setConfig(normalizeConfig(nextConfig as Partial<SiteConfigState>))
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to load site config.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      const nextConfig = await apiClient.admin.updateCmsSiteConfig(config as unknown as Record<string, unknown>)
      setConfig(normalizeConfig((nextConfig as Partial<SiteConfigState>) ?? config))
      setSuccessMsg('Site config saved successfully.')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to save site config.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadLogo(locale: LocaleKey, file: File) {
    setUploadingLocale(locale)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const upload = await apiClient.admin.uploadCmsSiteConfigLogo(locale, file)
      const url = upload?.url
      if (!url) {
        throw new Error('Upload did not return a usable logo URL.')
      }

      setConfig((prev) => ({
        ...prev,
        branding: {
          ...prev.branding,
          [locale]: {
            ...prev.branding[locale],
            logoUrl: url,
          },
        },
      }))
      setSuccessMsg(locale === 'ar' ? 'تم رفع الشعار بنجاح.' : 'Logo uploaded successfully.')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to upload logo.')
    } finally {
      setUploadingLocale(null)
    }
  }

  function setTopBar(patch: Partial<SiteConfigState['topBar']>) {
    setConfig((prev: SiteConfigState) => ({ ...prev, topBar: { ...prev.topBar, ...patch } }))
  }

  function setFooter(patch: Partial<SiteConfigState['footer']>) {
    setConfig((prev: SiteConfigState) => ({ ...prev, footer: { ...prev.footer, ...patch } }))
  }

  function setSearch(patch: Partial<SiteConfigState['search']>) {
    setConfig((prev: SiteConfigState) => ({ ...prev, search: { ...prev.search, ...patch } }))
  }

  function setBranding(locale: LocaleKey, patch: Partial<SiteConfigState['branding'][LocaleKey]>) {
    setConfig((prev: SiteConfigState) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [locale]: {
          ...prev.branding[locale],
          ...patch,
        },
      },
    }))
  }

  return (
    <PageContainer>
      <AdminFormScaffold
        title="Site Config"
        subtitle="Manage shell-level content: branding, top bar message, footer copy, and search panel text."
        notice={
          errorMsg
            ? { tone: 'danger', message: errorMsg }
            : successMsg
              ? { tone: 'success', message: successMsg }
              : undefined
        }
        actions={
          <Button
            tone="primary"
            onClick={() => void handleSave()}
            disabled={saving || loading}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
              <Save size={14} />
              {saving ? 'Saving…' : 'Save'}
            </span>
          </Button>
        }
      >
        <div />
      </AdminFormScaffold>

      {errorMsg ? (
        <AdminErrorState message={errorMsg} onRetry={() => void load()} />
      ) : loading ? (
        <AdminLoadingSkeleton />
      ) : (
        <div style={{ display: 'grid', gap: spacing['24'] }}>
          {/* Branding */}
          <Section>
            <SectionCard title="Branding">
              <div
                style={{
                  display: 'grid',
                  gap: spacing['16'],
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
              >
                <BrandingLocaleCard
                  locale="en"
                  label="English"
                  branding={config.branding.en}
                  inputRef={uploadRefs.en}
                  uploading={uploadingLocale === 'en'}
                  onUploadClick={() => uploadRefs.en.current?.click()}
                  onUploadFile={async (file) => uploadLogo('en', file)}
                  onChange={(patch) => setBranding('en', patch)}
                />
                <BrandingLocaleCard
                  locale="ar"
                  label="Arabic"
                  branding={config.branding.ar}
                  inputRef={uploadRefs.ar}
                  uploading={uploadingLocale === 'ar'}
                  onUploadClick={() => uploadRefs.ar.current?.click()}
                  onUploadFile={async (file) => uploadLogo('ar', file)}
                  onChange={(patch) => setBranding('ar', patch)}
                />
              </div>
            </SectionCard>
          </Section>

          {/* Top Bar */}
          <Section>
            <SectionCard title="Top Bar">
              <LocalizedPair
                labelEn="Message (EN)"
                labelAr="Message (AR)"
                valueEn={config.topBar.messageEn}
                valueAr={config.topBar.messageAr}
                onChangeEn={(v) => setTopBar({ messageEn: v })}
                onChangeAr={(v) => setTopBar({ messageAr: v })}
              />
              <LocalizedPair
                labelEn="CTA Label (EN)"
                labelAr="CTA Label (AR)"
                valueEn={config.topBar.ctaLabelEn}
                valueAr={config.topBar.ctaLabelAr}
                onChangeEn={(v) => setTopBar({ ctaLabelEn: v })}
                onChangeAr={(v) => setTopBar({ ctaLabelAr: v })}
              />
              <SingleField
                label="CTA Href"
                value={config.topBar.ctaHref}
                onChange={(v) => setTopBar({ ctaHref: v })}
                placeholder="/shop"
              />
            </SectionCard>
          </Section>

          {/* Footer */}
          <Section>
            <SectionCard title="Footer">
              <LocalizedPair
                labelEn="Newsletter Title (EN)"
                labelAr="Newsletter Title (AR)"
                valueEn={config.footer.newsletterTitleEn}
                valueAr={config.footer.newsletterTitleAr}
                onChangeEn={(v) => setFooter({ newsletterTitleEn: v })}
                onChangeAr={(v) => setFooter({ newsletterTitleAr: v })}
              />
              <LocalizedPair
                labelEn="Legal Text (EN)"
                labelAr="Legal Text (AR)"
                valueEn={config.footer.legalEn}
                valueAr={config.footer.legalAr}
                onChangeEn={(v) => setFooter({ legalEn: v })}
                onChangeAr={(v) => setFooter({ legalAr: v })}
              />
            </SectionCard>
          </Section>

          {/* Search */}
          <Section>
            <SectionCard title="Search">
              <LocalizedPair
                labelEn="Panel Title (EN)"
                labelAr="Panel Title (AR)"
                valueEn={config.search.panelTitleEn}
                valueAr={config.search.panelTitleAr}
                onChangeEn={(v) => setSearch({ panelTitleEn: v })}
                onChangeAr={(v) => setSearch({ panelTitleAr: v })}
              />
            </SectionCard>
          </Section>
        </div>
      )}
    </PageContainer>
  )
}
