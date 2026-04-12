export function withEnv(overrides: Record<string, string | undefined>, run: () => void | Promise<void>) {
  const snapshot = new Map<string, string | undefined>()
  for (const [key, value] of Object.entries(overrides)) {
    snapshot.set(key, process.env[key])
    if (typeof value === 'undefined') {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  return Promise.resolve(run()).finally(() => {
    for (const [key, value] of Array.from(snapshot.entries())) {
      if (typeof value === 'undefined') {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  })
}
