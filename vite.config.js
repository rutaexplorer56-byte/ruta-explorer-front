import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'


// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build') {
    const api = (process.env.VITE_API_URL || env.VITE_API_URL || '').trim();
    let url;
    try { url = new URL(api); } catch { throw new Error('Configura VITE_API_URL con la URL pública HTTPS del backend antes de compilar.'); }
    if (url.protocol !== 'https:' || /^(localhost|127\.0\.0\.1)$/.test(url.hostname) || url.pathname.replace(/\/+$/, '') || url.search || url.hash || url.username || url.password) {
      throw new Error('VITE_API_URL debe ser el origen público HTTPS del backend, sin /api, credenciales ni parámetros.');
    }
  }
  return {
  plugins: [react()],
  base: '/app/', 
 
  };
})
