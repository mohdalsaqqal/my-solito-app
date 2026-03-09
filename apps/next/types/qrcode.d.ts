declare module 'qrcode' {
  export type QRCodeToDataURLOptions = {
    width?: number
    margin?: number
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H'
    color?: {
      dark?: string
      light?: string
    }
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
}
