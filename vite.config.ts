import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = process.env.VITE_ENV === 'dev'
  
  return {
    define: {
      'process.env': env,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: isDev ? {
        '/api': {
          target: 'https://dev-tms-admin.gsrental.cn:7443', // 本地开发后端地址
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      } : undefined,
    },
  }
})
