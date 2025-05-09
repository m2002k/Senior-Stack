/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // 👈 fixes "document is not defined"
    globals: true,         // (optional) allows describe/it/expect globally
    setupFiles: './src/setupTests.js' // already created by you!
  },
});
