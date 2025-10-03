export const isValidAccountId = (accountId: string): boolean => {
  if (!accountId || typeof accountId !== 'string') return false
  const accountIdRegex = /^\d+\.\d+\.\d+$/
  return accountIdRegex.test(accountId)
}

export const isValidPrivateKey = (privateKey: string): boolean => {
  if (!privateKey || typeof privateKey !== 'string') return false
  return privateKey.length === 64 && /^[a-fA-F0-9]+$/.test(privateKey)
}

export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(num) && num > 0 && isFinite(num)
}

export const isValidTokenId = (tokenId: string): boolean => {
  if (!tokenId || typeof tokenId !== 'string') return false
  return /^\d+\.\d+\.\d+$/.test(tokenId)
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateQuantumDNA = (dna: any): boolean => {
  return dna && 
         dna.signature && 
         typeof dna.signature === 'string' &&
         typeof dna.entropy === 'number' && 
         dna.quantumState &&
         typeof dna.quantumState.superposition === 'number' &&
         typeof dna.quantumState.entanglement === 'number' &&
         typeof dna.quantumState.coherence === 'number'
}

export const validatePhysicsProperties = (properties: any): boolean => {
  return properties &&
         typeof properties.magnitude === 'number' && properties.magnitude > 0 &&
         typeof properties.duration === 'number' && properties.duration > 0 &&
         typeof properties.range === 'number' && properties.range > 0 &&
         typeof properties.energyCost === 'number' && properties.energyCost > 0
}

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"']/g, '')
}

export const isValidTransactionId = (txId: string): boolean => {
  return /^\d+\.\d+\.\d+@\d+\.\d+$/.test(txId)
}