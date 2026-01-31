import dotenv from 'dotenv'
dotenv.config();

import mongoose from 'mongoose';
import app from './app'
import './models/Post'
import './models/User'

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI!)

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
})