import { randomBytes, randomUUID } from 'node:crypto'
import type { GameRoom, Player } from './roomTypes.js'

const rooms = new Map<string, GameRoom>()
const RECONNECT_GRACE_MS = 2 * 60 * 1000

const ALLOWED_PLAYER_COUNTS = new Set([2, 3, 4, 6, 8, 9, 10, 12])
const ROOM_CODE_LENGTH = 6
const ROOM_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode(): string {
  let code = ''

  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () => {
      const index = randomBytes(1)[0] % ROOM_CODE_CHARACTERS.length
      return ROOM_CODE_CHARACTERS[index]
    }).join('')
  } while (rooms.has(code))

  return code
}

function validateName(name: string): string {
  if (typeof name !== 'string') {
    throw new Error('Enter a valid display name.')
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 1 || trimmedName.length > 20) {
    throw new Error('Your display name must be 1–20 characters long.')
  }

  return trimmedName
}

function createPlayer(
  socketId: string,
  name: string,
  isHost: boolean,
): Player {
  return {
    id: socketId,
    name: validateName(name),
    isHost,
    joinedAt: Date.now(),
    reconnectToken: randomUUID(),
    connected: true,
  }
}

export function createRoom(
  socketId: string,
  name: string,
  maxPlayers: number,
): { room: GameRoom; reconnectToken: string } {
  if (!Number.isInteger(maxPlayers) || !ALLOWED_PLAYER_COUNTS.has(maxPlayers)) {
    throw new Error('Choose a supported number of players.')
  }

  const host = createPlayer(socketId, name, true)
  const code = generateRoomCode()

  const room: GameRoom = {
    code,
    hostId: socketId,
    maxPlayers,
    players: [host],
    createdAt: Date.now(),
  }

  rooms.set(code, room)

  return { room, reconnectToken: host.reconnectToken }
}

export function joinRoom(
  socketId: string,
  name: string,
  roomCode: string,
): { room: GameRoom; reconnectToken: string } {
  const playerName = validateName(name)

  if (typeof roomCode !== 'string') {
    throw new Error('Enter a valid room code.')
  }

  const code = roomCode.trim().toUpperCase()
  const room = rooms.get(code)

  if (!room) {
    throw new Error('Room not found. Check the code and try again.')
  }

  if (room.players.length >= room.maxPlayers) {
    throw new Error('This room is already full.')
  }

  const player = createPlayer(socketId, playerName, false)
  room.players.push(player)

  return { room, reconnectToken: player.reconnectToken }
}

export function reconnectPlayer(
  socketId: string,
  roomCode: string,
  reconnectToken: string,
): GameRoom {
  if (typeof roomCode !== 'string' || typeof reconnectToken !== 'string') {
    throw new Error('Invalid reconnection details.')
  }

  const room = rooms.get(roomCode.trim().toUpperCase())

  if (!room) {
    throw new Error('This room no longer exists.')
  }

  const player = room.players.find(
    (candidate) => candidate.reconnectToken === reconnectToken,
  )

  if (!player) {
    throw new Error('Could not verify your place in this room.')
  }

  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer)
    player.disconnectTimer = undefined
  }

  if (room.closeTimer) {
    clearTimeout(room.closeTimer)
    room.closeTimer = undefined
  }

  player.id = socketId
  player.connected = true

  if (player.isHost) {
    room.hostId = socketId
  }

  return room
}

export function disconnectPlayer(
  socketId: string,
  onExpired: (result: { room: GameRoom; closed: boolean }) => void,
): { room: GameRoom; closed: false } | undefined {
  for (const room of rooms.values()) {
    const player = room.players.find((candidate) => candidate.id === socketId)

    if (!player) {
      continue
    }

    player.connected = false

    const expire = () => {
      const currentRoom = rooms.get(room.code)
      if (!currentRoom) return

      const currentPlayer = currentRoom.players.find(
        (candidate) => candidate.reconnectToken === player.reconnectToken,
      )

      // Ignore an old timer if the player has already reconnected.
      if (!currentPlayer || currentPlayer.connected) return

      if (currentPlayer.isHost) {
        if (currentRoom.closeTimer) clearTimeout(currentRoom.closeTimer)
        rooms.delete(currentRoom.code)
        onExpired({ room: currentRoom, closed: true })
        return
      }

      currentRoom.players = currentRoom.players.filter(
        (candidate) => candidate.reconnectToken !== currentPlayer.reconnectToken,
      )

      onExpired({ room: currentRoom, closed: false })
    }

    player.disconnectTimer = setTimeout(expire, RECONNECT_GRACE_MS)

    if (player.isHost) {
      room.closeTimer = player.disconnectTimer
    }

    return { room, closed: false }
  }

  return undefined
}
