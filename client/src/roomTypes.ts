export type Player = {
  id: string
  name: string
  isHost: boolean
  joinedAt: number
  connected: boolean
}

export type PublicRoom = {
  code: string
  maxPlayers: number
  players: Player[]
  hostId: string
}

export type RoomCredentials = {
  code: string
  reconnectToken: string
}

export type RoomResult = {
  success: boolean
  room?: PublicRoom
  credentials?: RoomCredentials
  message?: string
}
