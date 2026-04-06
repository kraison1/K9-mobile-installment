import { Module } from '@nestjs/common';
import { CustomerImageService } from './customer-image.service';
import { CustomerImageController } from './customer-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerImage } from './entities/customer-image.entity';
import { Customer } from '../customer/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerImage, Customer])],
  controllers: [CustomerImageController],
  providers: [CustomerImageService],
})
export class CustomerImageModule {}
