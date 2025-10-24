import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'build'
  },
  define: {
    // Define environment variables
    'import.meta.env.VITE_API_URL': JSON.stringify('https://wledwebsite-production.up.railway.app'),
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify('pk_live_51RTQmbAxfoQFWwHUewaz3Jr8G6V76WX1tklQ4ZHAfO7iBoezhTAKGp7ABmt25LiBB6dvIxJJ6Qt75Py66yR68Our00zgGezTnr')
  }
})
