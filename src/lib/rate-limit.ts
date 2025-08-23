// Rate limiting simple en memoria para producción
// En un entorno real, usar Redis para rate limiting distribuido

interface RateLimitOptions {
  interval: number // Intervalo en milisegundos
  uniqueTokenPerInterval: number // Máximo número de tokens únicos por intervalo
}

interface TokenBucket {
  count: number
  lastReset: number
}

class RateLimiter {
  private tokens: Map<string, TokenBucket> = new Map()
  private interval: number
  private uniqueTokenPerInterval: number

  constructor(options: RateLimitOptions) {
    this.interval = options.interval
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval
    
    // Limpiar tokens expirados cada minuto
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  async check(limit: number, token: string): Promise<void> {
    const now = Date.now()
    const bucket = this.tokens.get(token)

    if (!bucket) {
      // Primer request de este token
      this.tokens.set(token, {
        count: 1,
        lastReset: now
      })
      return
    }

    // Verificar si necesitamos resetear el bucket
    if (now - bucket.lastReset > this.interval) {
      bucket.count = 1
      bucket.lastReset = now
      return
    }

    // Verificar límite
    if (bucket.count >= limit) {
      throw new Error('Rate limit exceeded')
    }

    bucket.count++
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredTokens: string[] = []

    for (const [token, bucket] of this.tokens.entries()) {
      if (now - bucket.lastReset > this.interval * 2) {
        expiredTokens.push(token)
      }
    }

    expiredTokens.forEach(token => {
      this.tokens.delete(token)
    })

    // Limitar el número total de tokens para evitar memory leaks
    if (this.tokens.size > this.uniqueTokenPerInterval * 2) {
      const tokensToDelete = Array.from(this.tokens.keys())
        .slice(0, this.tokens.size - this.uniqueTokenPerInterval)
      
      tokensToDelete.forEach(token => {
        this.tokens.delete(token)
      })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Rate limiter cleanup: ${expiredTokens.length} expired tokens removed, ${this.tokens.size} active tokens`)
    }
  }

  getStats(): { activeTokens: number, totalRequests: number } {
    let totalRequests = 0
    for (const bucket of this.tokens.values()) {
      totalRequests += bucket.count
    }

    return {
      activeTokens: this.tokens.size,
      totalRequests
    }
  }
}

// Instancia global del rate limiter
let globalRateLimiter: RateLimiter

export function rateLimit(options: RateLimitOptions): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(options)
  }
  return globalRateLimiter
}

// Rate limiter específico para APIs
export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500
})

// Rate limiter más estricto para autenticación
export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 100
})
