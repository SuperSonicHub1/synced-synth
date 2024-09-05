import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
// https://automerge.org/docs/library_initialization/#vite
export default defineConfig({
  plugins: [
    svelte(),
    wasm(),
    topLevelAwait(),
  ],
})
