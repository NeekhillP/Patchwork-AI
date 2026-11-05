import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  },
});

io.use((socket, next) =>{
  try{

    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    // Verify the token (e.g., using JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded){
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.user = decoded; // Attach user info to socket object
    next();

  } catch(error){
    next(error)
  }
})

io.on('connection', socket => {
  console.log('A client connected');

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

try {
  await connectDB();

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
}
