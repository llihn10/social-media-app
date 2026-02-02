import express from 'express'
import cors from 'cors'
import postRoutes from './routes/post.route'
import searchRoutes from './routes/search.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/posts', postRoutes)

app.use('/search', searchRoutes)

export default app