import { SocketsService } from '@modules/sockets.service'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Socket } from 'socket.io'
import Mock = jest.Mock

type MockedSocket = Socket & {
  emit: Mock
}

describe('socketsService', () => {
  let socketsService: SocketsService<DefaultEventsMap>
  let mockSocket: MockedSocket

  beforeEach(() => {
    socketsService = new SocketsService()
    mockSocket = {
      emit: jest.fn(),
    } as MockedSocket
  })

  it('should be able to bind a socket to an uid and emit events to it', () => {
    socketsService.add('1', mockSocket)
    socketsService.emit('1', 'test passed')
    expect(mockSocket.emit.mock.calls.length).toBe(1)
    expect(mockSocket.emit.mock.calls[0][0]).toBe('test passed')
  })

  it('should not emit events to removed sockets', () => {
    const mockEmit = jest.fn()
    const socket = {
      emit: mockEmit,
    } as unknown as Socket

    socketsService.add('uid', socket)
    socketsService.remove('uid', socket)

    socketsService.emit('uid', 'event')
    expect(mockEmit.mock.calls.length).toBe(0)
  })

  it('should emit events to every bound socket', () => {
    const mockSocket2 = {
      emit: jest.fn(),
    } as MockedSocket

    socketsService.add('uid', mockSocket)
    socketsService.add('uid', mockSocket2)
    socketsService.emit('uid', 'test passed')

    expect(mockSocket.emit.mock.calls.length).toBe(1)
    expect(mockSocket.emit.mock.calls[0][0]).toBe('test passed')
    expect(mockSocket2.emit.mock.calls.length).toBe(1)
    expect(mockSocket2.emit.mock.calls[0][0]).toBe('test passed')
  })

  describe('add', () => {
    it('should bind one socket to one uid', () => {
      const socket1 = {} as Socket
      socketsService.add('1', socket1)
      expect(socketsService.getUserCount()).toBe(1)
    })
  })
})
