module.exports = {
  locales: ['en', 'ar'],
  defaultNamespace: 'common',
  namespaceSeparator: false,
  keySeparator: '.',
  createOldCatalogs: false,
  keepRemoved: false,
  sort: true,
  indentation: 2,
  output: '../../packages/app/lib/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: [
    '../../packages/app/**/*.{ts,tsx}',
    '../../apps/next/app/**/*.{ts,tsx}',
    '../../apps/next/proxy.ts',
    '../../apps/expo/App.tsx',
    '../../apps/expo/app/**/*.{ts,tsx}',
  ],
}
