export type ExtensionAttributes = Record<string, unknown>

export type SourceEntityMeta = {
  system: string
  table?: string
  schemaVersion: string
  externalId?: string
  syncedAt?: string
  mappedColumns?: string[]
}

export type CanonicalEntity = {
  attributes?: ExtensionAttributes
  sourceMeta?: SourceEntityMeta
}
