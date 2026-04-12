import { CanonicalEntity } from '@real/providers/contracts'

type SourceRow = Record<string, unknown>

type BuildCanonicalMetadataInput = {
  row: SourceRow
  canonicalKeys: readonly string[]
  system: string
  table: string
  schemaVersion: string
  externalIdField?: string
}

export function buildCanonicalMetadata(
  input: BuildCanonicalMetadataInput
): Pick<CanonicalEntity, 'attributes' | 'sourceMeta'> {
  const canonicalSet = new Set(input.canonicalKeys)
  const attributes = Object.fromEntries(
    Object.entries(input.row).filter(([key]) => !canonicalSet.has(key))
  )

  const mappedColumns = Object.keys(input.row).filter((key) => canonicalSet.has(key))
  const externalValue =
    typeof input.externalIdField === 'string' ? input.row[input.externalIdField] : undefined

  return {
    attributes,
    sourceMeta: {
      system: input.system,
      table: input.table,
      schemaVersion: input.schemaVersion,
      externalId:
        typeof externalValue === 'string' || typeof externalValue === 'number'
          ? String(externalValue)
          : undefined,
      syncedAt: new Date().toISOString(),
      mappedColumns,
    },
  }
}
