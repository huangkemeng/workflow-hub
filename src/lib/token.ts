import crypto from 'crypto'

export function generateShareToken(): string {
  return crypto.randomBytes(8).toString('hex')
}

export function calculateExpiry(expiresIn: '7d' | '30d' | null): Date | null {
  if (!expiresIn) return null

  const days = expiresIn === '7d' ? 7 : 30
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
