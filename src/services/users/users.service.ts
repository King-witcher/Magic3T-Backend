import { Injectable } from '@nestjs/common'
import { Register } from '../registers/registers.service'
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import { firestore } from 'src/config/firestore'

export interface User {
  nickname: string
  rating: number
}

@Injectable()
export class UsersService {
  readonly collection = collection(firestore, 'users')

  async findById(id: string) {
    const userRef = await getDoc(doc(firestore, 'users', id))
    return userRef.data() as User
  }

  async findByRegister(register: Register): Promise<User> {
    const userRef = await getDoc(register.userData)
    return userRef.data() as User
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const q = query(this.collection, where('nickname', '==', nickname), limit(1))
    const docRefArray = await getDocs(q)

    return new Promise<User | null>((resolve) => {
      docRefArray.docs.forEach(data => {
        return resolve(data.data() as User)
      })
      resolve(null)
    })
  }
}
