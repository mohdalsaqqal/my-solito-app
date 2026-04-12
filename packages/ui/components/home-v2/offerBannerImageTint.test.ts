import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREEN_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  '_reference',
  'SephoraReferenceHome.tsx',
)

test('offer banners derive a web gradient from the image and hero cards keep a white-led tinted gradient', async () => {
  const source = await fs.readFile(SCREEN_PATH, 'utf8')

  assert.match(source, /function useImageDrivenGradient\(imageUrl: string \| undefined, variant: 'offer' \| 'hero'\)/)
  assert.match(source, /sampleAverageImageColor\(imageUrl\)/)
  assert.match(source, /hashImageUrlToRgb\(imageUrl\)/)
  assert.match(source, /backgroundImage: imageDrivenGradient \?\? tone\.radialOverlayGradient/)
  assert.match(source, /backgroundColor: colors\.white/)
  assert.match(source, /const imageDrivenPanelGradient = useImageDrivenGradient\(item\.imageUrl, 'hero'\)/)
  assert.match(source, /backgroundImage: imageDrivenPanelGradient \?\? theme\.panelGradient/)
})
