import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    ssr: true,
    rollupOptions: {
      input: './src/bot.ts', // точка входа
    },
  },
});
