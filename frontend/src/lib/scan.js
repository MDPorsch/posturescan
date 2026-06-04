import { SEVERITY_RANK } from './grade.js'

export const SCAN_STEPS = [
  'Resolving domain',
  'Checking TLS certificate',
  'Analysing HTTP headers',
  'Inspecting cookie flags',
  'Probing for open redirects',
  'Checking DNS records',
  'Detecting HTTP version',
  'Checking for mixed content',
  'Computing grade',
]

export function groupByCategory(results) {
  const map = new Map()
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, [])
    map.get(r.category).push(r)
  }
  for (const arr of map.values()) {
    arr.sort((a, b) =>
      (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9) ||
      a.check_key.localeCompare(b.check_key)
    )
  }
  return Array.from(map.entries())
}
