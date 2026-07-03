/**
 * Demo state management — localStorage-backed persona / linked-product / fs
 * user-id helpers. Ported from the source demo; used by the BigQuery sync
 * payloads (lib/bq/sync.ts).
 */
import { getVisitorId } from '@/lib/fx/browser-client'

const STORAGE_KEYS = {
  USER: 'brightstream-user',
  PERSONA: 'brightstream-persona',
  LINKED_PRODUCTS: 'brightstream-linked-products',
  SAVINGS_APPLICATION_PROGRESS: 'brightstream-savings-application-progress',
} as const

const FS_USER_ID_PREFIX = 'brightstream-fs-user-id:'

const PRESERVED_COOKIES = new Set(['demo-banner-hidden'])

function clearAllCookies(): void {
  if (typeof document === 'undefined') return
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (name && !PRESERVED_COOKIES.has(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  }
}

/** Reset all demo state — clears localStorage + cookies, dispatches `demo:reset`. */
export function resetDemoState(): void {
  if (typeof window === 'undefined') return
  localStorage.clear()
  clearAllCookies()
  window.dispatchEvent(new CustomEvent('demo:reset'))
}

export function getSelectedPersonaId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.PERSONA)
}

export function setSelectedPersonaId(id: string | null): void {
  if (typeof window === 'undefined') return
  if (id) localStorage.setItem(STORAGE_KEYS.PERSONA, id)
  else localStorage.removeItem(STORAGE_KEYS.PERSONA)
  window.dispatchEvent(new CustomEvent('demo:persona-changed', { detail: { persona: id } }))
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.USER) !== null
}

export function getCurrentUserData<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? (JSON.parse(data) as T) : null
}

export function setUserData(data: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('demo:user-changed', { detail: { user: data } }))
}

export function getLinkedProductIds(): string[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEYS.LINKED_PRODUCTS)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function setLinkedProductIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  const deduped = Array.from(new Set(ids))
  localStorage.setItem(STORAGE_KEYS.LINKED_PRODUCTS, JSON.stringify(deduped))
  window.dispatchEvent(
    new CustomEvent('demo:linked-products-changed', { detail: { productIds: deduped } }),
  )
}

export function addLinkedProductId(id: string): string[] {
  const next = Array.from(new Set([...getLinkedProductIds(), id]))
  setLinkedProductIds(next)
  return next
}

export function removeLinkedProductId(id: string): string[] {
  const next = getLinkedProductIds().filter((p) => p !== id)
  setLinkedProductIds(next)
  return next
}

export function getSavingsApplicationProgress(): 2 | 3 | null {
  if (typeof window === 'undefined') return null
  const n = Number(localStorage.getItem(STORAGE_KEYS.SAVINGS_APPLICATION_PROGRESS))
  return n === 2 || n === 3 ? n : null
}

export function setSavingsApplicationProgress(step: 2 | 3): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.SAVINGS_APPLICATION_PROGRESS, String(step))
}

export function clearSavingsApplicationProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.SAVINGS_APPLICATION_PROGRESS)
}

/**
 * Return a stable `fs_user_id` for a customer, persisting on first capture.
 * Snapshots the canonical visitor id (getVisitorId) on first call per customer.
 */
export function getOrPersistFsUserId(customerId: string): string {
  if (typeof window === 'undefined') return ''
  const key = `${FS_USER_ID_PREFIX}${customerId}`
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const fresh = getVisitorId()
  localStorage.setItem(key, fresh)
  return fresh
}

export function clearUserData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.USER)
  window.dispatchEvent(new CustomEvent('demo:user-changed', { detail: { user: null } }))
}
