import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import postRoutes from './routes/post.route'
import followRoutes from './routes/follow.route'
import likeRoutes from './routes/like.route'
import commentRoutes from './routes/comment.route'
import searchRoutes from './routes/search.route'
import notificationRoutes from './routes/notification.route'
import adminRoutes from './routes/admin.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.use('/', userRoutes)

app.use('/posts', postRoutes)

app.use('/search', searchRoutes)

app.use('/users', followRoutes)

app.use('/post', likeRoutes)

app.use('/comment', commentRoutes)

app.use('/notifications', notificationRoutes)

app.use('/admin', adminRoutes)

export default app