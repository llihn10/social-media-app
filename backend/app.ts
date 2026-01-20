import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/search', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend connected 🚀' })
})

export default app