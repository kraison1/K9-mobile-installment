import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import { ProductSale } from '../product-sale/entities/product-sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, User, ProductSale]),
    FirebaseModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
