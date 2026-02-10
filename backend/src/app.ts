import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import postRoutes from './routes/post.route'
import searchRoutes from './routes/search.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.use('/', userRoutes)

app.use('/api/posts', postRoutes)

app.use('/search', searchRoutes)

export default app