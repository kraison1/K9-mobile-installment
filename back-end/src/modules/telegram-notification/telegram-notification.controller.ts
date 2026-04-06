import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TelegramNotificationService } from './telegram-notification.service';
import { ApiTags } from '@nestjs/swagger';
import { NotificationDto } from 'src/helper/search.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('Telegram-notification')
@Controller('telegram-notification')
export class TelegramNotificationController {
  constructor(
    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  @Cron('0 2 0 * * *', {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/fetchProductDaylily')
  async fetchProductDaylily() {
    await this.telegramNotificationService.fetchProductDaylily();
  }

  @Cron('0 4 0 * * *', {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/fetchProductAccessibilityDaylily')
  async fetchProductAccessibilityDaylily() {
    await this.telegramNotificationService.fetchProductAccessibilityDaylily();
  }

  @Cron('0 6 0 * * *', {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/fetchProductSaleDaylily')
  async fetchProductSaleDaylily() {
    await this.telegramNotificationService.fetchProductSaleDaylily('1'); // มือถือ
    await this.telegramNotificationService.fetchProductSaleDaylily('0'); // อุปกรณ์
  }

  @Post('/send-notification')
  async sendNotification(@Body() notification: NotificationDto) {
    return await this.telegramNotificationService.sendTelegramNotify(
      notification,
    );
  }

  @Cron('0 8 0 * * *', {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/fetchProductPayMent')
  async fetchProductPayMent() {
    await this.telegramNotificationService.fetchProductPayMent();
  }
}
