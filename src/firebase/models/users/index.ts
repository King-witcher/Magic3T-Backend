import { firestore } from '@/firebase/services'
import { getConverter } from '../getConverter'
import { Glicko, User } from './User'
import { NotFoundError } from '../errors/NotFoundError'

const converter = getConverter<User>()
const usersCollection = firestore.collection('users').withConverter(converter)

async function getById(id: string): Promise<User> {
  const doc = await usersCollection.doc(id).get()
  const data = doc.data()

  if (!data) throw new NotFoundError('users', id)

  return data
}

async function updateGlicko(id: string, glicko: Glicko) {
  await usersCollection.doc(id).update({
    glicko: glicko,
  })
}

export const users = { getById, updateGlicko }
