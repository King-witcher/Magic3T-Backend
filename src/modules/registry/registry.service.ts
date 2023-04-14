import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Registry } from 'src/entities/Registry';
import { Repository } from 'typeorm';

@Injectable()
export class RegistryService {
  constructor (
    @InjectRepository(Registry)
    private registryRepository: Repository<Registry>
  ) { }

  async createRegistry(email: string, username: string, password: string) {
    const newRegistry = this.registryRepository.create({
      email, username
    })
    newRegistry.setPassword(password)
    await newRegistry.save()
  }

  async findByUsername(username: string): Promise<Registry | null> {
    return await this.registryRepository.findOneBy({ username }) || null
  }
}
