import { PartialType } from '@nestjs/swagger';
import { CreateTelegramNotificationDto } from './create-telegram-notification.dto';

export class UpdateTelegramNotificationDto extends PartialType(CreateTelegramNotificationDto) {}
