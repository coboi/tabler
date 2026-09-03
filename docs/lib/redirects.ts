// Renamed/moved docs pages; add an entry whenever a docs URL changes.
// Shared by astro.config.mjs (real HTTP redirects) and middleware.ts (which
// must let these urls fall through instead of rewriting them to `.md`).

type Redirect = { status: 301; destination: string }

export const redirects: Record<string, Redirect> = {
  '/ui/base/markdown': { status: 301, destination: '/ui/base/prose' },
  // Single-theme fork: the Payments section was hard-deleted; the old plugin
  // page now lands on the plugins index.
  '/ui/plugins/payments': { status: 301, destination: '/ui/plugins' },
  // @tabler/icons-eps is no longer maintained; PDF is the vector format to use.
  '/icons/static-files/eps': { status: 301, destination: '/icons/static-files/pdf' },
  // pre-Astro plural slugs, still present in the Google index and backlinks
  ...Object.fromEntries(
    [
      ['alerts', 'alert'],
      ['avatars', 'avatar'],
      ['badges', 'badge'],
      ['buttons', 'button'],
      ['cards', 'card'],
      ['dropdowns', 'dropdown'],
      ['icons', 'icon'],
      ['modals', 'modal'],
      ['ribbons', 'ribbon'],
      ['spinners', 'spinner'],
      ['statuses', 'status'],
      ['steps', 'step'],
      ['tables', 'table'],
      ['tabs', 'tab'],
      ['timelines', 'timeline'],
      ['toasts', 'toast'],
      ['tooltips', 'tooltip'],
    ].map(([from, to]): [string, Redirect] => [`/ui/components/${from}`, { status: 301, destination: `/ui/components/${to}` }]),
  ),
  // Components that need a third-party library moved to /ui/plugins/.
  ...Object.fromEntries(['autosize', 'chart', 'countup', 'dropzone', 'range-slider', 'signature', 'wysiwyg'].map((slug): [string, Redirect] => [`/ui/components/${slug}`, { status: 301, destination: `/ui/plugins/${slug}` }])),
  // Hard-deleted plugin pages (fullcalendar, inline-player, lightbox,
  // vector-map): the old component URLs land on the plugins index.
  ...Object.fromEntries(['fullcalendar', 'inline-player', 'lightbox', 'vector-map'].map((slug): [string, Redirect] => [`/ui/components/${slug}`, { status: 301, destination: '/ui/plugins' }])),
  // Pre-Astro plural urls for two of those pages, sent straight to the new home.
  '/ui/components/charts': { status: 301, destination: '/ui/plugins/chart' },
  '/ui/components/vector-maps': { status: 301, destination: '/ui/plugins' },
  // The form- prefix was redundant inside /ui/forms/.
  '/ui/forms/form-elements': { status: 301, destination: '/ui/forms/elements' },
  '/ui/forms/form-fieldset': { status: 301, destination: '/ui/forms/fieldset' },
  '/ui/forms/form-floating': { status: 301, destination: '/ui/forms/floating-labels' },
  '/ui/forms/form-helpers': { status: 301, destination: '/ui/forms/helpers' },
  '/ui/forms/form-selectboxes': { status: 301, destination: '/ui/forms/select-group' },
  '/ui/forms/form-image-check': { status: 301, destination: '/ui/forms/image-check' },
  '/ui/forms/form-color-check': { status: 301, destination: '/ui/forms/color-check' },
  '/ui/forms/form-select-tomselect': { status: 301, destination: '/ui/plugins/advanced-select' },
  // The color-picker plugin was hard-deleted; land on the forms index.
  '/ui/forms/form-colorpicker': { status: 301, destination: '/ui/forms' },
  '/ui/forms/form-datepicker': { status: 301, destination: '/ui/plugins/date-picker' },
  '/ui/forms/form-input-mask': { status: 301, destination: '/ui/plugins/input-mask' },
  '/ui/forms/form-validation': { status: 301, destination: '/ui/forms/validation' },
  // Illustrations and Emails sections were hard-deleted; land on the docs home.
  '/illustrations/introduction': { status: 301, destination: '/' },
  '/illustrations/introduction/preview': { status: 301, destination: '/' },
  '/illustrations/introduction/contents': { status: 301, destination: '/' },
  '/illustrations/introduction/customization': { status: 301, destination: '/' },
  '/illustrations/introduction/license': { status: 301, destination: '/' },
  '/emails/introduction': { status: 301, destination: '/' },
  '/emails/introduction/contents': { status: 301, destination: '/' },
  '/emails/introduction/compiled-html': { status: 301, destination: '/' },
  '/emails/introduction/source-html': { status: 301, destination: '/' },
}
