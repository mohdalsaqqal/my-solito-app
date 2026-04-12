import fs from 'node:fs/promises'
import path from 'node:path'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'offer-banners')
const MAX_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const formData = await request.formData().catch(() => null) as globalThis.FormData | null
    if (!formData) return fail('UPLOAD_INVALID', 'Expected multipart/form-data.', 400)

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return fail('UPLOAD_MISSING_FILE', 'No file provided.', 400)
    }

    if (file.size === 0) {
      return fail('UPLOAD_EMPTY_FILE', 'Image file is empty.', 400)
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return fail('UPLOAD_INVALID_TYPE', 'Only JPEG, PNG and WebP images are accepted.', 415)
    }

    if (file.size > MAX_SIZE_BYTES) {
      return fail('UPLOAD_TOO_LARGE', 'Image must be under 4 MB.', 413)
    }

    const bytes = await file.arrayBuffer()

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const filename = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    await fs.writeFile(filepath, Buffer.from(bytes))

    const url = `/uploads/offer-banners/${filename}`
    return ok({ url })
  } catch (cause) {
    return fail(
      'UPLOAD_UNEXPECTED',
      'Unexpected error while uploading image.',
      500,
      { scope: 'POST /api/admin/cms/offer-banners/upload', cause }
    )
  }
}
