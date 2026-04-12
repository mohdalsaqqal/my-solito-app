import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const TICKER_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  'components',
  'home-v2',
  'AnnouncementTicker.tsx',
)

test('announcement ticker uses a reliable looping marquee on web', async () => {
  const source = await fs.readFile(TICKER_PATH, 'utf8')

  assert.match(source, /I18nManager/)
  assert.match(source, /const WEB_TICKER_KEYFRAMES_ID = 'announcement-ticker-keyframes'/)
  assert.match(source, /@keyframes announcementTickerMarqueeLtr/)
  assert.match(source, /@keyframes announcementTickerMarqueeRtl/)
  assert.match(source, /ensureWebTickerKeyframes\(\)/)
  assert.match(source, /const \[containerWidth, setContainerWidth\] = useState\(0\)/)
  assert.match(source, /const sequenceRepeatCount = useMemo\(/)
  assert.match(source, /Math\.max\(3, Math\.ceil\(containerWidth \/ trackWidth\) \+ 2\)/)
  assert.match(source, /if \(isWeb\) return/)
  assert.match(source, /translateX\.setValue\(isRTL \? -trackWidth : 0\)/)
  assert.match(source, /toValue: isRTL \? 0 : -trackWidth/)
  assert.match(source, /animationName: isRTL \? 'announcementTickerMarqueeRtl' : 'announcementTickerMarqueeLtr'/)
  assert.match(source, /animationIterationCount: 'infinite'/)
  assert.match(source, /animationPlayState: paused \? 'paused' : 'running'/)
  assert.match(source, /Array\.from\(\{ length: sequenceRepeatCount \}/)
  assert.match(source, /const TICKER_BACKGROUND = colors\.brandPrimary/)
  assert.match(source, /borderRadius: radius\.sm/)
  assert.match(source, /tone='inverse'/)
  assert.match(source, /•/)
})
