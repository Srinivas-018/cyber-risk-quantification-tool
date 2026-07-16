import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      // The master policy: Explicitly defining every single sub-directive to eliminate fallback warnings
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:8080; manifest-src 'self'; worker-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
      
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Server': 'SecureServer'
    }
  }
})