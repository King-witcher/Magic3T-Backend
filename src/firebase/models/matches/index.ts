import { database } from '@/firebase/services'
import { MatchRegistry } from './MatchRegistry'
import { getConverter } from '../getConverter'

const converter = getConverter<MatchRegistry>()
const collection = database.collection('matches').withConverter(converter)

export async function save(match: MatchRegistry) {
  await collection.doc(match._id).create(match)
}

export const matches = { collection, save }
