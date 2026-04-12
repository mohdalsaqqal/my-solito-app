import { accountProvider } from '@real/providers'
import { ServiceError } from '../_lib/service-error'

type AddressPayload = {
  label?: string
  city?: string
  area?: string
  building?: string
  floor?: string
  apartment?: string
}

export async function listAccountAddresses(userId: string) {
  const result = await accountProvider.listAddresses(userId)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 500)
  }

  return result.data
}

export async function createAccountAddress(userId: string, body: AddressPayload) {
  const label = body.label?.trim() ?? ''
  const city = body.city?.trim() ?? ''
  const area = body.area?.trim() ?? ''
  const building = body.building?.trim() ?? ''

  if (!label || !city || !area || !building) {
    throw new ServiceError(
      'ACCOUNT_ADDRESS_CREATE_INVALID_PAYLOAD',
      'label, city, area, and building are required.',
      400,
    )
  }

  const result = await accountProvider.createAddress(userId, {
    label,
    city,
    area,
    building,
    floor: body.floor,
    apartment: body.apartment,
  })

  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function updateAccountAddress(userId: string, id: string, body: AddressPayload) {
  const result = await accountProvider.updateAddress(userId, id, body)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function deleteAccountAddress(userId: string, id: string) {
  const result = await accountProvider.deleteAddress(userId, id)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

