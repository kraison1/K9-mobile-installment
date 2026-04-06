import { Module } from '@nestjs/common';
import { MSubdistrictService } from './m-subdistrict.service';
import { MSubdistrictController } from './m-subdistrict.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MSubdistrict } from './entities/m-subdistrict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MSubdistrict])],
  controllers: [MSubdistrictController],
  providers: [MSubdistrictService],
})
export class MSubdistrictModule {}
