import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const BRAIN = path.resolve('C:/Users/pc/.gemini/antigravity/brain/f6884f87-5955-4950-ab30-8f0dd4986333')

// Map: public filename → brain source filename
const TEAM_PHOTOS = {
  'neha.jpg':     'media__1778672939566.jpg',
  'shruti.jpg':   'media__1778673095983.jpg',
  'vivek.jpg':    'media__1778678552524.jpg',
  'abhishek.jpg': 'media__1778675137525.jpg',
}

// Serve team photos directly during dev + copy to public/ for production builds
const serveTeamPhotos = () => ({
  name: 'serve-team-photos',
  // Dev: intercept image requests and pipe from brain storage
  configureServer(server) {
    const photoMap = Object.fromEntries(
      Object.entries(TEAM_PHOTOS).map(([dest, src]) => [
        `/${dest}`, path.join(BRAIN, src)
      ])
    )
    server.middlewares.use((req, res, next) => {
      const filePath = photoMap[req.url]
      if (filePath && fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(filePath).pipe(res)
      } else {
        next()
      }
    })
  },
  // Build: always copy latest images into public/ for production
  buildStart() {
    const publicDir = path.join(process.cwd(), 'public')
    Object.entries(TEAM_PHOTOS).forEach(([dest, src]) => {
      const srcPath = path.join(BRAIN, src)
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(publicDir, dest))
        console.log(`✅ Copied ${dest} to public/`)
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveTeamPhotos()],
})
