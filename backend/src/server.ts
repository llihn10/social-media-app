import dotenv from 'dotenv'
import mongoose from 'mongoose';
import app from './app'
import http from 'http';
import { initSocket } from './configs/socket';

dotenv.config();

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI!)

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
})