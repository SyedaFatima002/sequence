export type Player = {
  id: string
  name: string
  isHost: boolean
  joinedAt: number
  reconnectToken: string
  connected: boolean
  disconnectTimer?: ReturnType<typeof setTimeout>
}

export type GameRoom = {
  code: string
  hostId: string
  maxPlayers: number
  players: Player[]
  createdAt: number
  closeTimer?: ReturnType<typeof setTimeout>
}

export type PublicPlayer = {
  id: string
  name: string
  isHost: boolean
  joinedAt: number
  connected: boolean
}

export type PublicRoom = {
  code: string
  maxPlayers: number
  players: PublicPlayer[]
  hostId: string
}

export type RoomCredentials = {
  code: string
  reconnectToken: string
}

export function toPublicRoom(room: GameRoom): PublicRoom {
  return {
    code: room.code,
    maxPlayers: room.maxPlayers,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      joinedAt: player.joinedAt,
      connected: player.connected,
    })),
    hostId: room.hostId,
  }
}
