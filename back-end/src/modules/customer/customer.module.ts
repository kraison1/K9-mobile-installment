import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { CustomerImage } from '../customer-image/entities/customer-image.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductModule } from '../product/product.module';
import { User } from '../users/entities/user.entity';
import { UserGroup } from '../user-groups/entities/user-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Branch,
      CustomerImage,
      ProductSale,
      User,
      UserGroup,
    ]),
    ProductModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
