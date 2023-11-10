export default abstract class Publisher<T extends string = string> {
  private observers: Record<string, (() => void)[]> = {}

  protected publish(event: T) {
    for (const observer of this.observers[event]) {
      observer()
    }
  }

  public subscribe(event: T, observer: () => void) {
    if (this.observers[event]) this.observers[event].push(observer)
    else this.observers[event] = [observer]
  }
}
