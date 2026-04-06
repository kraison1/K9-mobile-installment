import { Module } from '@nestjs/common';
import { LatestNewsService } from './latest-news.service';
import { LatestNewsController } from './latest-news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatestNew } from './entities/latest-new.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LatestNew])],
  controllers: [LatestNewsController],
  providers: [LatestNewsService],
  exports: [LatestNewsService],
})
export class LatestNewsModule {}
