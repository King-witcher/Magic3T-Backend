import { Module } from '@nestjs/common'
import { RegistryController } from './registry.controller'
import { RegistryService } from './registry.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from 'src/entities/Registry'

@Module({
  imports: [TypeOrmModule.forFeature([Registry])],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService]
})
export class RegistryModule {}
