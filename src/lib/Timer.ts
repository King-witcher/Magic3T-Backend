enum SnapshotState {
  Paused = 'paused',
  Counting = 'counting',
  Finished = 'finished',
}

type TimeSnapshot = {
  /** When the snapshot was created */
  at: number
  /** The value when the snapshot was created */
  value: number
  /** The state of the snapshot at that moment */
  state: SnapshotState
}

export class Timer {
  private lastSnapshot: TimeSnapshot
  private callbackCaller: NodeJS.Timeout
  private readonly callback: () => void

  constructor(timeMs: number, callback: () => void) {
    this.lastSnapshot = {
      at: Date.now(),
      value: timeMs,
      state: SnapshotState.Paused,
    }
    this.callback = callback
  }

  private handleTimeout() {
    this.lastSnapshot = {
      at: Date.now(),
      value: 0,
      state: SnapshotState.Finished,
    }

    this.callback()
  }

  public get remaining(): number {
    switch (this.lastSnapshot.state) {
      case SnapshotState.Counting: {
        const now = Date.now()
        const timeSinceSnapshot = now - this.lastSnapshot.at
        return this.lastSnapshot.value - timeSinceSnapshot
      }
      case SnapshotState.Paused:
        return this.lastSnapshot.value
      default:
        return 0
    }
  }

  public set remaining(value: number) {
    if (this.lastSnapshot.state === SnapshotState.Finished) return

    this.lastSnapshot = {
      at: Date.now(),
      value: value,
      state: this.lastSnapshot.state,
    }

    if (this.lastSnapshot.state === SnapshotState.Counting) {
      clearTimeout(this.callbackCaller)
      this.callbackCaller = setTimeout(this.handleTimeout.bind(this), value)
    }
  }

  public pause() {
    if (this.lastSnapshot.state !== SnapshotState.Counting) return

    clearTimeout(this.callbackCaller)
    this.lastSnapshot = {
      at: Date.now(),
      value: this.remaining,
      state: SnapshotState.Paused,
    }
  }

  public start() {
    if (this.lastSnapshot.state !== SnapshotState.Paused) return

    this.lastSnapshot = {
      at: Date.now(),
      value: this.remaining,
      state: SnapshotState.Counting,
    }
    this.callbackCaller = setTimeout(
      this.handleTimeout.bind(this),
      this.remaining,
    )
  }
}
