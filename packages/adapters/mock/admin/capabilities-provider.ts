import { CommerceCapabilityProvider } from '@real/providers/contracts'
import { mockCommerceCapabilities } from './capabilities'

export const mockCommerceCapabilityAdapter: CommerceCapabilityProvider = {
  async getCapabilities() {
    return {
      ok: true,
      data: mockCommerceCapabilities,
    }
  },
}
