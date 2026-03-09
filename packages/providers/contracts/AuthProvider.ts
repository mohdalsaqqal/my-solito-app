import { ProviderResult } from './types'

export type AuthRole =
  | 'customer'
  | 'pharmacist'
  | 'admin'
  | 'marketing'
  | 'catalog'
  | 'support'
  | 'ops'

export type AuthSession = {
  userId: string
  email: string
  name: string
  role: AuthRole
}

export type AuthLoginInput = {
  email: string
  password: string
}

export type AuthRegisterInput = {
  name: string
  email: string
  password: string
}

export type AuthResetRequestInput = {
  email: string
}

export type AuthResetPasswordInput = {
  token: string
  newPassword: string
}

export type AuthRequestAck = {
  accepted: boolean
}

export interface AuthProvider {
  getSession(): Promise<ProviderResult<AuthSession | null>>
  login(input: AuthLoginInput): Promise<ProviderResult<AuthSession>>
  register(input: AuthRegisterInput): Promise<ProviderResult<AuthSession>>
  logout(): Promise<ProviderResult<AuthRequestAck>>
  requestPasswordReset(input: AuthResetRequestInput): Promise<ProviderResult<AuthRequestAck>>
  resetPassword(input: AuthResetPasswordInput): Promise<ProviderResult<AuthRequestAck>>
}
