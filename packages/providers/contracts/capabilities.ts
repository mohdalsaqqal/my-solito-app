import { CommerceCapabilities, ProviderResult } from './types'

export interface CommerceCapabilityProvider {
  getCapabilities(): Promise<ProviderResult<CommerceCapabilities>>
}
