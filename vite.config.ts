import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'oh-be-sidian',
      formats: ['es'],
      fileName: 'oh-be-sidian'
    }
  }
})
