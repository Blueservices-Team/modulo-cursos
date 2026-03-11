/**
 * Configuración vía variables de entorno (ENV).
 * Vite expone solo las variables con prefijo VITE_.
 * Archivo: .env o .env.local en la raíz del proyecto.
 */

export function getTrainingApiUrl(): string {
  return (import.meta.env.VITE_TRAINING_API_URL ?? "").toString().trim()
}

export function isExternalTrainingApi(): boolean {
  return getTrainingApiUrl().length > 0
}
