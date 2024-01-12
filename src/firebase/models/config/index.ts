import { database } from '@/firebase/services'
import { getConverter } from '../getConverter'
import { RatingConfig } from './RatingConfig'

const converter = getConverter<RatingConfig>()

let lastResponse: RatingConfig | null = null

/** Returns the cached version of the config, if there is one. Otherwise, requests and caches a new one for 1 minute. */
export async function getRatingConfig(): Promise<RatingConfig> {
  if (lastResponse) return lastResponse

  const snap = await database
    .collection('config')
    .doc('rating')
    .withConverter(converter)
    .get()

  const data = snap.data()

  if (!data) throw new Error('No rating config found no database.')

  lastResponse = data

  setTimeout(() => {
    lastResponse = null
  }, 1000 * 60)

  return (lastResponse = data)
}
