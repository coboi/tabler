// Single-pass CSS pipeline shared by @tabler/core and @tabler/preview.
//
// Runs sass, autoprefixer, the --tblr- prefix and clean-css in one
// process; each output file is written exactly once, fully processed. The
// options mirror the CLI invocations this replaced:
// - sass --no-source-map --load-path=node_modules --style expanded
// - postcss (autoprefixer cascade:false, external map with
//   annotation + sourcesContent)
// - cleancss -O1 --format breakWith=lf --with-rebase --source-map
//   --source-map-inline-sources --batch --batch-suffix ".min"
// The one deviation, breaks:afterComment, is documented on minify() below.
//
// --banner adds the license comment before any source map is generated, so
// the maps account for its lines (#2766).
//
// Usage: tsx ../.build/build-css.ts <scssDir> <outDir> [--minify] [--banner] [--no-maps] [--min-only]
// (cwd = the package)
//
// --no-maps skips all source map output (.css.map + .min.css.map and their
// annotations). Used for the published core/dist payload; dev servers keep
// the default maps behavior.
//
// --min-only (requires --minify) writes just the .min.css files, skipping the
// non-minified intermediates. Used for the published core/dist payload.
/// <reference path="./modules.d.ts" />
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { EOL } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { compile as compileSass } from 'sass'
import postcss, { type Result } from 'postcss'
import autoprefixer from 'autoprefixer'
import prefixCustomProperties from 'postcss-prefix-custom-properties'
import CleanCSS from 'clean-css'
import { addBanner } from '../shared/banner/index.mjs'
import { cssVarIgnore, cssVarPrefix } from './css-var-prefix'

const args = process.argv.slice(2)
const flags = args.filter((arg) => arg.startsWith('--'))
const [scssDir, outDir] = args.filter((arg) => !arg.startsWith('--'))
if (!scssDir || !outDir) {
  console.error('usage: tsx build-css.ts <scssDir> <outDir> [--minify] [--banner] [--no-maps] [--min-only]')
  process.exit(1)
}
const withMinify = flags.includes('--minify')
const withBanner = flags.includes('--banner')
const withMaps = !flags.includes('--no-maps')
const minOnly = flags.includes('--min-only')
if (minOnly && !withMinify) {
  console.error('build-css: --min-only requires --minify')
  process.exit(1)
}

const mapOptions = { inline: false, annotation: true, sourcesContent: true }

const written: string[] = []
const pendingWrites: { file: string; content: string }[] = []

// Skipping identical content keeps file watchers quiet for outputs a given scss
// edit did not actually change (the dev servers full-reload on these writes).
function queueWrite(file: string, content: string) {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return
  pendingWrites.push({ file, content })
}

// sass + autoprefixer for one entry: scss/x.scss → outDir/x.css (+ .map)
async function compile(entry: string): Promise<{ outFile: string; result: Result }> {
  const outFile = join(outDir, `${basename(entry, '.scss')}.css`)
  const compiled = compileSass(join(scssDir, entry), { loadPaths: ['node_modules'], style: 'expanded' })
  // The sass CLI ends its output files with a newline; the JS API's css string
  // does not. Keep the byte-identical CLI behavior (the annotation comment then
  // lands after a blank line, exactly like `postcss --replace` produced).
  const css = `${compiled.css}\n`
  // Banner goes in before postcss runs, so the map it generates already counts
  // the banner's lines.
  const input = withBanner ? addBanner(css, outFile) : css
  // Prefixing is its own pass, ahead of the one that generates the map:
  // postcss maps generated positions back to *its own input*, so renaming
  // inside the map-generating pass would leave every mapping — and the
  // embedded sourcesContent — describing css that no longer exists on disk.
  const { css: prefixed } = await postcss([prefixCustomProperties({ prefix: cssVarPrefix, ignore: cssVarIgnore })]).process(input, { from: outFile, to: outFile, map: false })
  const result = await postcss([autoprefixer({ cascade: false })]).process(prefixed, {
    from: outFile,
    to: outFile,
    map: withMaps ? mapOptions : false,
  })
  queueWrite(outFile, result.css)
  if (withMaps && result.map) queueWrite(`${outFile}.map`, result.map.toString())
  written.push(outFile)
  return { outFile, result }
}

// All compile work is done before the first write: compiles take seconds while
// writes take milliseconds, so watchers see one tight burst instead of writes
// spread across the whole build (which would need a long reload debounce).
function flushWrites(): void {
  for (const { file, content } of pendingWrites) {
    writeFileSync(file, content)
    console.log(`build-css: ${file}`)
  }
}

// clean-css over every produced file: outDir/x.css → outDir/x.min.css (+ .map).
// Mirrors clean-css-cli's option coercion and batch output naming/annotation
// (see the clean-css-cli package's index.js).
//
// breaks:afterComment is the one deviation: clean-css counts the lines a kept
// `/*! … */` comment spans but not the `*/` it leaves on the last one, so every
// mapping on that line comes out `'*/'.length` columns short. Ending the line
// after the comment puts the css at column 0 — exactly where the map says.
async function minify(files: string[]): Promise<void> {
  const minified = await new CleanCSS({
    batch: true,
    // zeroUnits (default true) strips the unit off zero values, e.g. `0%` -> `0`.
    // clean-css only skips this inside calc/rgb/hsl/rgba/hsla/min/max/clamp —
    // not color-mix() — so it turns `color-mix(in srgb, x 0%, y)` into
    // `color-mix(in srgb, x 0, y)`. Unlike <length>, <percentage> has no
    // unitless-zero exception, so that's invalid CSS and the whole color-mix()
    // (and the gradient layer using it, e.g. .card-gradient) silently drops.
    // Covered by .build/build-css.test.ts.
    compatibility: { properties: { zeroUnits: false } },
    format: 'breakWith=lf;breaks:afterComment=on',
    inline: 'local',
    level: { 1: true },
    rebase: true,
    rebaseTo: resolve(outDir),
    returnPromise: true,
    sourceMap: withMaps,
    sourceMapInlineSources: withMaps,
  }).minify(files)
  for (const inputFile of files) {
    const fileResult = minified[inputFile]
    if (!fileResult) throw new Error(`build-css: no minify result for ${inputFile}`)
    if (fileResult.errors.length > 0) throw new Error(fileResult.errors.join('\n'))
    for (const warning of fileResult.warnings) console.warn(`build-css: ${warning}`)
    const minFile = inputFile.replace(/\.css$/, '.min.css')
    const minContent = withMaps ? `${fileResult.styles}${EOL}/*# sourceMappingURL=${basename(minFile)}.map */` : `${fileResult.styles}${EOL}`
    writeFileSync(minFile, minContent)
    if (withMaps) writeFileSync(`${minFile}.map`, fileResult.sourceMap.toString())
    console.log(`build-css: ${minFile}`)
  }
}

// Wrapped in a function because tsx compiles root-level .ts as CJS, where
// top-level await is unavailable.
async function main() {
  const entries = readdirSync(scssDir).filter((file) => file.endsWith('.scss') && !file.startsWith('_'))
  mkdirSync(outDir, { recursive: true })

  for (const entry of entries) {
    await compile(entry)
  }
  flushWrites()
  if (withMinify) await minify(written)
  if (minOnly) {
    // Publish minified files only: drop the non-minified intermediates (and
    // any of their maps) written above.
    for (const file of written) {
      rmSync(file, { force: true })
      rmSync(`${file}.map`, { force: true })
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
