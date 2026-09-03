import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'

interface CreateViteConfigOptions {
  entry: string
  name?: string
  fileName: string | ((format: string) => string)
  formats: ('es' | 'umd' | 'iife' | 'cjs')[]
  outDir: string
  banner?: string
  minify?: boolean | 'esbuild'
}

/**
 * Creates a Vite configuration for building libraries.
 *
 * Sourcemaps are on by default (dev servers rely on them). Set
 * TABLER_SOURCEMAP=false to skip .js.map output for published payloads.
 */
export function createViteConfig({ entry, name, fileName, formats, outDir, banner, minify = false }: CreateViteConfigOptions): UserConfig {
  // Vite 8 (Rolldown) always emits const bindings and no longer accepts the
  // Rollup-only generatedCode.constBindings option
  const rollupOutput: { banner?: string } = {}

  if (banner) {
    rollupOutput.banner = banner
  }

  const config: UserConfig = {
    // Library builds: never copy <root>/public into outDir (see copy-assets.ts).
    publicDir: false,
    build: {
      lib: {
        entry: path.resolve(entry),
        name: name,
        fileName: typeof fileName === 'function' ? fileName : () => fileName,
        formats: formats,
      },
      outDir: path.resolve(outDir),
      emptyOutDir: false,
      sourcemap: process.env.TABLER_SOURCEMAP === 'false' ? false : true,
      rollupOptions: {
        output: rollupOutput,
      },
      target: 'es2015',
      minify: minify,
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    esbuild: {
      target: 'es2015',
      tsconfigRaw: {
        compilerOptions: {
          module: 'ES2020',
          target: 'ES2015',
        },
      },
    },
  }

  return defineConfig(config)
}
