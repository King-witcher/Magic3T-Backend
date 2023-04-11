import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Profile } from 'src/entities/Profile'
import { Repository } from 'typeorm'

@Injectable()
export class ProfileService {
  constructor (
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>
  ) { }

  async getById(id: number) {
    return await this.profileRepository.findOneBy({id: id})
  }
}
