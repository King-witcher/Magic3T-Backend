import { Module } from '@nestjs/common'
import { RegistryController } from './registry.controller'
import { RegistryService } from './registry.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from 'src/entities/Registry'
import { ProfileModule } from '../profile/profile.module'
import { Profile } from 'src/entities/Profile'

@Module({
  imports: [TypeOrmModule.forFeature([Registry, Profile]), ProfileModule],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
