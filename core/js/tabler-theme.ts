/**
 * demo-theme is specifically loaded right after the body and not deferred
 * to ensure we switch to the chosen dark/light theme as fast as possible.
 * This will prevent any flashes of the light theme (default) before switching.
 */
interface ThemeConfig {
  'theme': string
  'theme-font': string
}

const themeConfig: ThemeConfig = {
  'theme': 'light',
  'theme-font': 'sans-serif',
}

// Clean up stale Scandinavian hard-deleted keys from older builds
;['theme-base', 'theme-radius', 'theme-primary', 'sidebar'].forEach((k) => {
  localStorage.removeItem('tabler-' + k)
  document.documentElement.removeAttribute('data-bs-' + k)
  document.documentElement.removeAttribute('data-' + k)
})

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams: URLSearchParams, prop: string): string | null => searchParams.get(prop),
})

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

for (const key in themeConfig) {
  const param = params[key]
  let selectedValue: string

  if (!!param) {
    localStorage.setItem('tabler-' + key, param)
    selectedValue = param
  } else {
    const storedTheme = localStorage.getItem('tabler-' + key)
    selectedValue = storedTheme ? storedTheme : themeConfig[key as keyof ThemeConfig]
  }

  if (key === 'theme' && selectedValue === 'auto') {
    selectedValue = prefersDark.matches ? 'dark' : 'light'
  }

  if (selectedValue !== themeConfig[key as keyof ThemeConfig]) {
    document.documentElement.setAttribute('data-bs-' + key, selectedValue)
  } else {
    document.documentElement.removeAttribute('data-bs-' + key)
  }
}

prefersDark.addEventListener('change', (event) => {
  // Only when the stored choice is explicitly 'auto' should the theme follow the system.
  if ((localStorage.getItem('tabler-theme') ?? 'light') === 'auto') {
    if (event.matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-bs-theme')
    }
  }
})
