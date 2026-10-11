import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

const PORT = Number(process.env.PORT) || 3000

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Sequence server is running!',
  })
})

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`)

  socket.emit('server:welcome', {
    message: 'Connected to the Sequence server!',
  })

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Sequence server running at http://localhost:${PORT}`)
})
