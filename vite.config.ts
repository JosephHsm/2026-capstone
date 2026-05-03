import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      // 로컬 개발 시 /api, /sse 요청을 Spring Boot 백엔드로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/sse': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/schedule': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 기상청 ASOS CORS 우회 프록시 (/asos/* → https://apis.data.go.kr/*)
      '/asos': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/asos/, ''),
      },
    },
  },
})
