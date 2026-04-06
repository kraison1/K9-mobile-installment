import { Module } from '@nestjs/common';
import { ExpenseImagesService } from './expense-images.service';
import { ExpenseImagesController } from './expense-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseImage } from './entities/expense-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseImage])],
  controllers: [ExpenseImagesController],
  providers: [ExpenseImagesService],
})
export class ExpenseImagesModule {}
