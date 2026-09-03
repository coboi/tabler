import corePackage from '@tabler/core/package.json'
import iconsInfo from '../data/icons-info.json'

const version = corePackage.version

export const site = {
  title: 'Tabler',
  version,
  docsUrl: 'https://docs.tabler.io',
  cdnUrl: `https://cdn.jsdelivr.net/npm/@tabler/core@${version}`,
  email: 'support@tabler.io',
  previewUrl: 'https://preview.tabler.io',
  githubUrl: 'https://github.com/tabler/tabler',
  githubSponsorsUrl: 'https://github.com/sponsors/codecalm',
  icons: { link: 'https://tabler.io/icons' },
  // From shared/data/icons-info.json.
  iconsCount: 5986,
  iconsVersion: iconsInfo.version,
  descriptionShort: 'Premium and Open Source dashboard template with responsive and high quality UI.',
  description: 'Tabler is packed with beautifully crafted components and powerful features. Jump in and start building a stunning dashboard — all for free!',
  themeColor: '#000000',
  cssPlugins: ['socials', 'vendors', 'marketing', 'themes'],
  themeColors: ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark', 'muted'],
  themeFonts: ['sans-serif', 'monospace'],
  themeBases: ['slate'],
  themeRadiuses: ['0.5'],
}
