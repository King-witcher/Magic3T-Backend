import { database } from '@/firebase/services'
import { MatchRegistry } from './MatchRegistry'
import { getConverter } from '../getConverter'

const converter = getConverter<MatchRegistry>()
const matchesCollection = database.collection('matches').withConverter(converter)

export async function save(match: MatchRegistry) {
  await matchesCollection.doc(match._id).create(match)
}

export const matches = { save }
