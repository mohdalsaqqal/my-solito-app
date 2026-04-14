import fs from 'node:fs/promises'
import path from 'node:path'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'site-branding')
const MAX_SIZE_BYTES = 4 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const

type UploadLocale = 'en' | 'ar'

function resolveLocale(value: FormDataEntryValue | null): UploadLocale | null {
  if (value === 'en' || value === 'ar') {
    return value
  }
  return null
}

function resolveExtension(file: File): 'jpg' | 'png' | 'webp' | null {
  const mime = file.type.toLowerCase()
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'

  const name = file.name.toLowerCase()
  if (name.endsWith('.png')) return 'png'
  if (name.endsWith('.webp')) return 'webp'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg'

  return null
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const formData = await request.formData().catch(() => null) as globalThis.FormData | null
    if (!formData) {
      return fail('UPLOAD_INVALID', 'Expected multipart/form-data.', 400)
    }

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return fail('UPLOAD_MISSING_FILE', 'No file provided.', 400)
    }

    const locale = resolveLocale(formData.get('locale'))
    if (!locale) {
      return fail('UPLOAD_INVALID_LOCALE', 'Locale must be en or ar.', 400)
    }

    if (file.size === 0) {
      return fail('UPLOAD_EMPTY_FILE', 'Image file is empty.', 400)
    }

    if (file.size > MAX_SIZE_BYTES) {
      return fail('UPLOAD_TOO_LARGE', 'Image must be under 4 MB.', 413)
    }

    const extension = resolveExtension(file)
    if (!extension) {
      return fail('UPLOAD_INVALID_TYPE', 'Only JPEG, PNG and WebP images are accepted.', 415)
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    await Promise.all(
      ALLOWED_EXTENSIONS.map(async (candidate) => {
        const stalePath = path.join(UPLOAD_DIR, `logo-${locale}.${candidate}`)
        await fs.rm(stalePath, { force: true })
      })
    )

    const filename = `logo-${locale}.${extension}`
    const filepath = path.join(UPLOAD_DIR, filename)
    const bytes = await file.arrayBuffer()

    await fs.writeFile(filepath, Buffer.from(bytes))

    return ok({
      locale,
      filename,
      url: `/uploads/site-branding/${filename}`,
    })
  } catch (cause) {
    return fail(
      'UPLOAD_UNEXPECTED',
      'Unexpected error while uploading image.',
      500,
      { scope: 'POST /api/admin/cms/site-config/logo-upload', cause }
    )
  }
}
