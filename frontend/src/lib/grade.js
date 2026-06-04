export const GRADE_COLORS = {
  A: { text: '#10B981', ring: '#10B981', bg: '#10B98114', label: 'Strong'   },
  B: { text: '#34D399', ring: '#34D399', bg: '#34D39914', label: 'Solid'    },
  C: { text: '#FBBF24', ring: '#FBBF24', bg: '#FBBF2414', label: 'Mixed'    },
  D: { text: '#F97316', ring: '#F97316', bg: '#F9731614', label: 'Weak'     },
  F: { text: '#EF4444', ring: '#EF4444', bg: '#EF444414', label: 'Critical' },
}

export const STATUS_COLORS = {
  pass: '#10B981',
  warn: '#FBBF24',
  fail: '#EF4444',
  info: '#94A3B8',
}

export const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

export const CATEGORY_LABELS = {
  tls:       'TLS / SSL',
  headers:   'HTTP Headers',
  cookies:   'Cookies',
  redirects: 'Redirects',
  dns:       'DNS Health',
  http:      'HTTP Version',
  mixed:     'Mixed Content',
}
