// The `--tblr-` custom-property prefix, applied at build time.
//
// Custom properties are authored bare in scss (`--card-bg`) rather than through
// a Sass interpolation on every declaration and every var() call; the public
// prefix is added here, in the css pipeline (see build-css.ts).
//
// Lives in its own module so scss/tests/css-var-prefix.test.mjs asserts against
// the same configuration the build uses.
export const cssVarPrefix = 'tblr-'

// Names that must survive unprefixed. Everything here belongs to a third-party
// stylesheet we theme, and those libraries read their variables by their own
// name — prefixing one detaches the theming with no error anywhere, in css or
// at build time. Add an entry whenever a vendor override introduces a new
// foreign name.
export const cssVarIgnore = [
  /^--tblr-/, // already prefixed, e.g. names that cannot round-trip postcss (see $navbar-light-icon-color)
  /^--apx-/, // apexcharts
  /^--bs-/, // bootstrap
  /^--dt/, // datatables.net (--dt-* and --dt_* triplets)
  /^--gl-/, // star-rating.js
  /^--litepicker-/, // litepicker
  /^--ts-/, // tom-select
  '--section-bg', // marketing sections, unprefixed since it was introduced
]
