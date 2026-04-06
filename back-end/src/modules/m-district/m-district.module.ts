import { Module } from '@nestjs/common';
import { MDistrictService } from './m-district.service';
import { MDistrictController } from './m-district.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MDistrict } from './entities/m-district.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MDistrict])],
  controllers: [MDistrictController],
  providers: [MDistrictService],
})
export class MDistrictModule {}
