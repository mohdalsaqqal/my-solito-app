import { connection } from 'next/server'

export async function ensureRequestConnection() {
  try {
    await connection()
  } catch (error) {
    if (error instanceof Error && error.message.includes('outside a request scope')) {
      return
    }

    throw error
  }
}
