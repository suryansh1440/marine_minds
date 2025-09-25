import { io, Socket } from 'socket.io-client'
import store from '../store'
import type { AppDispatch } from '../store'
import {
  setConnectionStatus,
  setQueryType,
  addThought,
  addResult,
  addError,
  setIsResult,
} from '../slices/chatSlice'

type QueryTypePayload = { type: string }
type ThoughtsPayload = { message: string }
type ResultPayload = { result: any }
type ErrorPayload = { message: string }

class SocketService {
  private socket: Socket | null
  private isConnected: boolean
  private dispatch: AppDispatch

  constructor() {
    this.socket = null
    this.isConnected = false
    this.dispatch = store.dispatch
  }

  connect(): Socket {
    if (this.socket) {
      return this.socket
    }

    this.socket = io('http://localhost:9000', { transports: ['websocket', 'polling'] })

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true
      this.dispatch(setConnectionStatus(true))
      console.log('Connected to socket')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      this.dispatch(setConnectionStatus(false))
    })

    // Backend emit events
    this.socket.on('query_type', (data: QueryTypePayload) => {
      this.dispatch(setQueryType(data.type))
    })

    this.socket.on('thoughts', (data: ThoughtsPayload) => {
      this.dispatch(addThought({ message: data.message }))
    })

    this.socket.on('result', (data: ResultPayload) => {
      this.dispatch(addResult(data.result))
    })

    this.socket.on('error', (data: ErrorPayload) => {
      this.dispatch(addError(data.message))
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.dispatch(setConnectionStatus(false))
    }
  }

  sendQuery(query: string): void {
    this.dispatch(setIsResult(false))
    if (this.socket && this.isConnected) {
      this.socket.emit('analyze_query', { query })
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export default new SocketService()
