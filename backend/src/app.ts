import express from 'express'
import cors from 'cors'
import postRoutes from './routes/post.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/posts', postRoutes)

app.get('/search', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend connected 🚀' })
})

export default app