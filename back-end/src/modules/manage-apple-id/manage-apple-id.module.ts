import { Module } from '@nestjs/common';
import { ManageAppleIdService } from './manage-apple-id.service';
import { ManageAppleIdController } from './manage-apple-id.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageAppleId } from './entities/manage-apple-id.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManageAppleId])],
  controllers: [ManageAppleIdController],
  providers: [ManageAppleIdService],
})
export class ManageAppleIdModule {}
