import { Global, Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserGroup } from '../user-groups/entities/user-group.entity';
import { Customer } from '../customer/entities/customer.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserGroup, Customer])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
