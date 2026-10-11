import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import {
  createRoom,
  joinRoom,
  reconnectPlayer,
  disconnectPlayer,
} from './rooms/roomManager.js'
import { toPublicRoom } from './rooms/roomTypes.js'

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

  socket.on('room:create', (data, callback) => {
    try {
      const { room, reconnectToken } = createRoom(
        socket.id,
        data.name,
        data.maxPlayers,
      )

      socket.join(room.code)

      callback?.({
        success: true,
        room: toPublicRoom(room),
        credentials: { code: room.code, reconnectToken },
      })
    } catch (error) {
      callback?.({
        success: false,
        message: error instanceof Error ? error.message : 'Could not create room.',
      })
    }
  })

  socket.on('room:join', (data, callback) => {
    try {
      const { room, reconnectToken } = joinRoom(
        socket.id,
        data.name,
        data.code,
      )

      socket.join(room.code)

      io.to(room.code).emit('room:updated', toPublicRoom(room))

      callback?.({
        success: true,
        room: toPublicRoom(room),
        credentials: { code: room.code, reconnectToken },
      })
    } catch (error) {
      callback?.({
        success: false,
        message: error instanceof Error ? error.message : 'Could not join room.',
      })
    }
  })

  socket.on('room:reconnect', (data, callback) => {
    try {
      const room = reconnectPlayer(
        socket.id,
        data.code,
        data.reconnectToken,
      )

      socket.join(room.code)

      io.to(room.code).emit('room:updated', toPublicRoom(room))

      callback?.({
        success: true,
        room: toPublicRoom(room),
      })
    } catch (error) {
      callback?.({
        success: false,
        message: error instanceof Error ? error.message : 'Could not reconnect.',
      })
    }
  })


  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`)

    const result = disconnectPlayer(socket.id, ({ room, closed }) => {
      if (closed) {
        io.to(room.code).emit('room:closed', {
          message: 'The host did not reconnect in time, so this room has closed.',
        })
      } else {
        io.to(room.code).emit('room:updated', toPublicRoom(room))
      }
    })

    if (result) {
      io.to(result.room.code).emit('room:updated', toPublicRoom(result.room))
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Sequence server running at http://localhost:${PORT}`)
})
