import { AxiosError } from 'axios'

/**
 * Error message mappings for user-friendly error display
 * Maps HTTP status codes and error patterns to Spanish user messages
 */
interface ErrorMapping {
  statusCode: number
  pattern?: RegExp
  message: string
}

const ERROR_MAPPINGS: ErrorMapping[] = [
  // 400 - Bad Request / Validation Errors
  {
    statusCode: 400,
    pattern: /required|faltante|missing/i,
    message: 'Por favor completa todos los campos requeridos',
  },
  {
    statusCode: 400,
    pattern: /username.*exist|already.*taken|ya existe/i,
    message: 'El nombre de usuario ya está en uso',
  },
  {
    statusCode: 400,
    pattern: /invalid|inválido/i,
    message: 'Los datos proporcionados no son válidos',
  },
  {
    statusCode: 400,
    pattern: /content|post/i,
    message: 'El contenido del post no es válido o está vacío',
  },
  {
    statusCode: 400,
    pattern: /search term|búsqueda/i,
    message: 'El término de búsqueda es requerido',
  },
  {
    statusCode: 400,
    message: 'Solicitud inválida. Por favor verifica los datos enviados',
  },

  // 401 - Unauthorized
  {
    statusCode: 401,
    pattern: /credential|password|invalid/i,
    message: 'Nombre de usuario o contraseña incorrectos',
  },
  {
    statusCode: 401,
    pattern: /token|unauthorized|no.*auth/i,
    message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  },
  {
    statusCode: 401,
    message: 'Debes iniciar sesión para realizar esta acción',
  },

  // 403 - Forbidden
  {
    statusCode: 403,
    pattern: /rate.*limit|too.*fast|slow.*down/i,
    message:
      'Estás realizando muchas acciones muy rápido. Intenta de nuevo en unos segundos',
  },
  {
    statusCode: 403,
    pattern: /access.*denied|forbidden|permission/i,
    message: 'No tienes permiso para realizar esta acción',
  },
  {
    statusCode: 403,
    pattern: /host|invalid.*host/i,
    message:
      'Error de configuración del servidor. Por favor contacta al administrador',
  },
  {
    statusCode: 403,
    message: 'Acceso denegado',
  },

  // 404 - Not Found
  {
    statusCode: 404,
    pattern: /post|comment|user/i,
    message: 'El recurso que buscas no existe o ha sido eliminado',
  },
  {
    statusCode: 404,
    message: 'Recurso no encontrado',
  },

  // 409 - Conflict
  {
    statusCode: 409,
    pattern: /duplicate|already.*exist|conflict/i,
    message: 'Este recurso ya existe',
  },
  {
    statusCode: 409,
    message: 'Hay un conflicto con la operación. Intenta de nuevo',
  },

  // 429 - Too Many Requests
  {
    statusCode: 429,
    message:
      'Demasiadas solicitudes. Por favor espera un momento antes de intentar de nuevo',
  },

  // 500 - Internal Server Error
  {
    statusCode: 500,
    message: 'Error en el servidor. Por favor intenta de nuevo más tarde',
  },

  // 503 - Service Unavailable
  {
    statusCode: 503,
    message:
      'El servicio no está disponible en este momento. Por favor intenta más tarde',
  },
]

/**
 * Extracts error message from various error response formats
 */
function extractErrorMessage(error: unknown): string | null {
  if (error instanceof AxiosError) {
    // Try to get error from response data
    const data = error.response?.data

    if (typeof data === 'string') {
      return data
    }

    if (data && typeof data === 'object') {
      // Check common error response structures
      if ('error' in data && typeof data.error === 'string') {
        return data.error
      }
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      if ('detail' in data && typeof data.detail === 'string') {
        return data.detail
      }
    }

    // Fallback to error message
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return null
}

/**
 * Gets the HTTP status code from an error
 */
function getStatusCode(error: unknown): number | null {
  if (error instanceof AxiosError) {
    return error.response?.status || null
  }
  return null
}

/**
 * Main error handler: converts errors to user-friendly Spanish messages
 * @param error The error object from axios or any error
 * @returns A user-friendly error message in Spanish
 */
export function handleError(error: unknown): string {
  const statusCode = getStatusCode(error)
  const errorMessage = extractErrorMessage(error)

  // If we don't have a status code, return a generic message
  if (statusCode === null) {
    if (errorMessage) {
      console.warn('Error without status code:', errorMessage)
      return 'Ocurrió un error. Por favor intenta de nuevo'
    }
    return 'Ocurrió un error inesperado'
  }

  // Find matching error mapping based on status code and error message pattern
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.statusCode === statusCode) {
      // If this mapping has a pattern, check if it matches the error message
      if (mapping.pattern && errorMessage) {
        if (mapping.pattern.test(errorMessage)) {
          return mapping.message
        }
      } else if (!mapping.pattern) {
        // No pattern means this is a catch-all for this status code
        // Continue to find more specific matches first
        continue
      }
    }
  }

  // Fallback to a generic message based on status code
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.statusCode === statusCode && !mapping.pattern) {
      return mapping.message
    }
  }

  // Ultimate fallback
  return `Error ${statusCode}: Ocurrió un problema. Por favor intenta de nuevo`
}

/**
 * Checks if an error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return (
      !error.response && (error.request || error.message.includes('Network'))
    )
  }
  return false
}

/**
 * Checks if an error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401
  }
  return false
}

/**
 * Checks if an error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 429
  }
  return false
}

/**
 * Checks if an error is a validation/bad request error (400)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 400
  }
  return false
}

/**
 * Checks if an error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 404
  }
  return false
}

/**
 * Checks if an error is a server error (500+)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    return status ? status >= 500 : false
  }
  return false
}

/**
 * Gets the HTTP status code from an error, or null if not available
 */
export function getErrorStatusCode(error: unknown): number | null {
  return getStatusCode(error)
}

/**
 * Gets the raw error message from the server
 */
export function getRawErrorMessage(error: unknown): string | null {
  return extractErrorMessage(error)
}
