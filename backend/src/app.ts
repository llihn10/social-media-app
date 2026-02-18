import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import postRoutes from './routes/post.route'
import followRoutes from './routes/follow.route'
import likeRoutes from './routes/like.route'
import searchRoutes from './routes/search.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.use('/', userRoutes)

app.use('/posts', postRoutes)

app.use('/search', searchRoutes)

app.use('/users', followRoutes)

app.use('/post', likeRoutes)

export default app