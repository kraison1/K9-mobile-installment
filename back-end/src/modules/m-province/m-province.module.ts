import { Module } from '@nestjs/common';
import { MProvinceService } from './m-province.service';
import { MProvinceController } from './m-province.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MProvince } from './entities/m-province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MProvince])],
  controllers: [MProvinceController],
  providers: [MProvinceService],
})
export class MProvinceModule {}
