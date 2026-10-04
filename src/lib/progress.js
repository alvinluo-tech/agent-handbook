import { useSyncExternalStore } from 'react'

export const PROGRESS_KEY = 'adg-quests'
let rawCache
let snapshot = {}
let memory = {}

export function normalizeChecks(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value)
    .filter(([key, list]) => /^(ch\d{2}|lab-[a-z0-9-]+)$/.test(key) && Array.isArray(list))
    .map(([key, list]) => [key, [...new Set(list.filter((i) => Number.isInteger(i) && i >= 0 && i < 100))]]))
}

export function readChecks() {
  let raw
  try { raw = localStorage.getItem(PROGRESS_KEY) || '{}' } catch { return memory }
  if (raw !== rawCache) {
    try { snapshot = normalizeChecks(JSON.parse(raw)) } catch { snapshot = {} }
    rawCache = raw
  }
  return snapshot
}

function subscribe(listener) {
  const storage = (e) => { if (e.key === PROGRESS_KEY || e.key === null) listener() }
  window.addEventListener('adg-quest-change', listener)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener('adg-quest-change', listener)
    window.removeEventListener('storage', storage)
  }
}

export function toggleQuest(id, index) {
  // 写入时重新读取，避免不同章节的旧快照覆盖彼此。
  const latest = readChecks()
  const done = new Set(latest[id] || [])
  if (done.has(index)) done.delete(index)
  else done.add(index)
  const next = { ...latest, [id]: [...done] }
  memory = next
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)) } catch {
    snapshot = next
    window.dispatchEvent(new Event('adg-storage-unavailable'))
  }
  window.dispatchEvent(new Event('adg-quest-change'))
}

export function useChecks() { return useSyncExternalStore(subscribe, readChecks, () => snapshot) }
