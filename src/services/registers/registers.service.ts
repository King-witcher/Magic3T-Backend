import { Injectable } from '@nestjs/common'
import { DocumentReference, collection, doc, getDoc } from 'firebase/firestore'
import { firestore } from 'src/config/firestore'
import { hashSync, compareSync } from 'bcrypt'

const SALT_ROUNDS = 12

export interface Register { 
  username: string
  email: string
  passwordDigest: string
  userData: DocumentReference
}

@Injectable()
export class RegistersService {

  readonly mockRegister: Register = {
    username: 'MockedUsername',
    email: 'mocked@email.com',
    passwordDigest: hashSync('right password', SALT_ROUNDS),
    userData: null
  }

  private collection = collection(firestore, 'registers')

  async getRegister(username: string): Promise<Register | undefined> {
    const docRef = await getDoc(doc(firestore, 'registers', username))
    return docRef.data() as Register
  }

  fakeValidatePassword(): false {
    this.validatePassword(this.mockRegister, 'wrong password')
    return false
  }

  validatePassword(register: Register, password: string): boolean {
    return compareSync(password, register.passwordDigest)
  }
}
