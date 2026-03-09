async function run() {
  const token = process.env.CROWDIN_TOKEN
  const projectId = process.env.CROWDIN_PROJECT_ID

  if (!token || !projectId) {
    console.log('[i18n:crowdin:mt] skipped (missing CROWDIN_PROJECT_ID/CROWDIN_TOKEN)')
    return
  }

  const response = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/translations/pre-translations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'mt',
      engineId: Number(process.env.CROWDIN_MT_ENGINE_ID || 0),
      languageIds: ['ar'],
      autoApproveOption: 'all',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Crowdin pre-translate failed (${response.status}): ${text}`)
  }

  console.log('[i18n:crowdin:mt] requested pre-translation')
}

run().catch((error) => {
  console.error('[i18n:crowdin:mt] failed', error)
  process.exit(1)
})
