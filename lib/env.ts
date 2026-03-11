/**
 * Configuración vía variables de entorno (ENV).
 * Todas las URLs y opciones del módulo de capacitación se leen desde aquí.
 *
 * En Next.js las variables deben estar en .env.local o .env
 * y las que expone al cliente deben tener prefijo NEXT_PUBLIC_.
 */

function getEnv(key: string): string {
  if (typeof process === "undefined" || !process.env) return ""
  return (process.env[key] ?? "").trim()
}

/** URL base de la API de capacitación (Training). Vacío = usar rutas Next locales. */
export function getTrainingApiUrl(): string {
  return getEnv("NEXT_PUBLIC_TRAINING_API_URL")
}

/** Indica si el front debe usar una API externa (true) o las rutas Next (false). */
export function isExternalTrainingApi(): boolean {
  return getTrainingApiUrl().length > 0
}
