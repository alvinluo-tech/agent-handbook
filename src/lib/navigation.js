import { useSyncExternalStore } from 'react'

const subscribe = (listener) => {
  window.addEventListener('hashchange', listener)
  window.addEventListener('popstate', listener)
  return () => {
    window.removeEventListener('hashchange', listener)
    window.removeEventListener('popstate', listener)
  }
}
export function useLocationHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '')
}
export function parseRoute(hash) {
  const [path = '', query = ''] = hash.replace(/^#/, '').split('?')
  return { path, params: new URLSearchParams(query) }
}
export function navigate(path, params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
  const hash = `#${path}${query ? `?${query}` : ''}`
  if (window.location.hash !== hash) window.location.hash = hash
}
export function updateFilters(values) {
  const { path, params } = parseRoute(window.location.hash)
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value)
    else params.delete(key)
  }
  // 输入不制造每字符一个历史项；分类和页面导航仍使用正常历史。
  window.history.replaceState(null, '', `#${path}?${params}`)
  window.dispatchEvent(new Event('hashchange'))
}
export function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
}
