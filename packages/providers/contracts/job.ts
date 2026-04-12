import { AdminJobCreateInput, AdminJobRecord, ProviderResult } from './types'

export interface AdminJobProvider {
  listJobs(): Promise<ProviderResult<AdminJobRecord[]>>
  getJob(id: string): Promise<ProviderResult<AdminJobRecord>>
  createJob(
    input: AdminJobCreateInput,
    actor: { userId: string; email: string }
  ): Promise<ProviderResult<AdminJobRecord>>
}

