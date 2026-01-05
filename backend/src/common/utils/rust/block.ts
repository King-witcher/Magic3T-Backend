export function block<T>(callback: () => T): T {
  return callback()
}
