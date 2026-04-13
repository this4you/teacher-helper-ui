import type { PresentationGenerationRequest } from './types.ts'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export async function generatePresentation(
  request: PresentationGenerationRequest,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${apiBaseUrl}/presentation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Помилка запиту: ${res.status}`)
  }

  const blob = await res.blob()
  const contentType = res.headers.get('Content-Type') ?? ''
  const disposition = res.headers.get('Content-Disposition') ?? ''

  let filename = extractFilename(disposition)

  if (!filename) {
    const ext = contentType.includes('application/zip') ? '.zip' : '.pptx'
    const now = new Date()
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
    ].join('-')
    filename = `presentation_${timestamp}${ext}`
  }

  return { blob, filename }
}

function extractFilename(disposition: string): string | null {
  if (!disposition) return null

  const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/i)
  if (utf8Match) return decodeURIComponent(utf8Match[1])

  const match = disposition.match(/filename="?([^";\n]+)"?/i)
  if (match) return match[1].trim()

  return null
}
