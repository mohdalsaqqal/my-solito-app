'use client'

import {
  AdminFormScaffold,
  EmptyState,
  PageContainer,
  Section,
} from '../_components/AdminPagePrimitives'

export default function AdminSettingsPage() {
  return (
    <PageContainer>
      <Section>
        <AdminFormScaffold
          title='Settings'
          subtitle='Platform-wide admin configuration.'
        >
          <EmptyState
            title='Settings modules are enabled by capabilities'
            description='Use provider capabilities and module-level policies to expose backend-specific settings safely.'
          />
        </AdminFormScaffold>
      </Section>
    </PageContainer>
  )
}


