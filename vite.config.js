import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', 
      devOptions: {
        enabled: true 
      },
      manifest: {
        name: 'Finansal Özet - Bütçe Takipçisi', 
        short_name: 'Bütçem', 
        description: 'Kişisel harcama ve bütçe takip uygulaması',
        theme_color: '#0b1a30', 
        background_color: '#0d2242', 
        display: 'standalone', 
        icons: [
          // YENİ: Dosya indirmek yerine kodla anında resim oluşturuyoruz
          {
            src: 'https://dummyimage.com/192x192/2788db/ffffff.png&text=B', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://dummyimage.com/512x512/2788db/ffffff.png&text=B',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})