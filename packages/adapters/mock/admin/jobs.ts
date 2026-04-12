import { AdminJobCreateInput, AdminJobProvider, ProviderResult } from '@real/providers/contracts'
import { readAdminMockState, updateAdminMockState } from './store'

function createJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const mockAdminJobAdapter: AdminJobProvider = {
  async listJobs() {
    const state = await readAdminMockState()
    return {
      ok: true,
      data: [...state.jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    } satisfies ProviderResult<typeof state.jobs>
  },
  async getJob(id) {
    const state = await readAdminMockState()
    const job = state.jobs.find((entry) => entry.id === id)
    if (!job) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_JOB_NOT_FOUND',
          message: 'Admin job was not found.',
        },
      }
    }
    return { ok: true, data: job }
  },
  async createJob(input: AdminJobCreateInput, actor) {
    const now = new Date().toISOString()
    const job = {
      id: createJobId(),
      type: input.type,
      entity: input.entity,
      status: 'succeeded' as const,
      createdAt: now,
      updatedAt: now,
      summary: input.summary,
      requestedBy: actor,
      targetIds: input.targetIds ?? [],
      input: input.input,
      result: {
        processedCount: input.targetIds?.length ?? 0,
        outcome: 'completed',
      },
    }
    const nextState = await updateAdminMockState((state) => {
      state.jobs.unshift(job)
    })
    const created = nextState.jobs.find((entry) => entry.id === job.id) ?? job
    return { ok: true, data: created }
  },
}

