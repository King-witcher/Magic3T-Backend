export default class Timer {
  private remaining: number
  private callback?: () => void
  private countingSince: number | null = null
  private timeout: NodeJS.Timeout | null = null

  constructor(initial: number, callback?: () => void) {
    this.remaining = initial
    this.callback = callback
  }

  start() {
    this.countingSince = Date.now()
    if (this.remaining > 0 && this.callback)
      this.timeout = setTimeout(this.callback, this.remaining)
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

  private updateRemaining() {
    if (this.countingSince) {
      const delta = Date.now() - this.countingSince
      this.remaining -= delta
      this.countingSince = Date.now()
    }
  }
}
