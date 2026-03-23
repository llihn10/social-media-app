import dotenv from 'dotenv'
dotenv.config();
import app from './app'
import http from 'http';
import { initSocket } from './configs/socket';
import connectDB from './configs/db';

const PORT = process.env.PORT || 3000;
connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
})