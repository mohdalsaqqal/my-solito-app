export class ServiceError extends Error {
  code: string
  status: number
  cause?: unknown

  constructor(code: string, message: string, status = 400, cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    this.status = status
    this.cause = cause
  }
}
