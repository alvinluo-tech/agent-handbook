import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' 确保部署在 GitHub Pages 二级目录 (https://<user>.github.io/<repo>/) 或任意根域名均能无缝加载资产
export default defineConfig({
  base: process.env.BASE_URL || './',
  plugins: [react()],
})
