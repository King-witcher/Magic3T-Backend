export default class Timer {
  private remaining: number
  private countingSince: number | null = null
  private timeout: NodeJS.Timeout | null = null
  public timeoutCallback?: () => void

  constructor(initial: number, callback?: () => void) {
    this.remaining = initial
    this.timeoutCallback = callback
  }

  start() {
    this.countingSince = Date.now()
    if (this.remaining > 0 && this.timeoutCallback)
      this.timeout = setTimeout(this.handleTimeout.bind(this), this.remaining)
  }

  pause() {
    if (this.timeout) clearTimeout(this.timeout)
    this.updateRemaining()
    this.countingSince = null
  }

  getRemaining() {
    this.updateRemaining()
    return this.remaining
  }

  private handleTimeout() {
    this.pause()
    this.remaining = 0
    this.timeout = null
    if (this.timeoutCallback) this.timeoutCallback()
  }

  private updateRemaining() {
    if (this.countingSince) {
      const delta = Date.now() - this.countingSince
      this.remaining -= delta
      this.countingSince = Date.now()
    }
  }
}
