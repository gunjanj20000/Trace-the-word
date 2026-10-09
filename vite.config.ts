import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/Trace-the-word/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
