import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth.js'
import steamRoutes from './routes/steam.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}))

// Routes
app.route('/auth', authRoutes)
app.route('/steam', steamRoutes)

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Steam Receipts API' }))

export default app
