export function delay(amount: number) {
  return new Promise((res) => {
    setTimeout(res, amount)
  })
}

export function block<T>(callback: () => T): T {
  return callback()
}
