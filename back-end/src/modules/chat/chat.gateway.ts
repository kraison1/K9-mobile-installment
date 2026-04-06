import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Req } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-chat.dto';
import { FastifyRequest } from 'fastify';

@WebSocketGateway({
  cors: {
    origin: [
      'https://thunderbolt.shop', // Domain ของ Web Admin (Production)
      // 'http://localhost:3001', // Domain สำหรับพัฒนา Web Admin
      // เพิ่ม Domain อื่นๆ ที่ต้องการอนุญาตที่นี่
    ],
    methods: ['GET', 'POST'], // อนุญาตเฉพาะ HTTP Method ที่จำเป็นสำหรับ Socket.IO
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  // private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  // Client ส่งข้อความมาที่นี่
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: CreateMessageDto,
  ): Promise<void> {
    // 1. บันทึกข้อความลง DB
    const message = await this.chatService.createMessage(payload);

    // 2. ส่งข้อความกลับไปยังทุกคนในห้องแชท (Conversation), รวมถึงผู้ส่ง
    this.server
      .to(`conversation_${message.conversation.id}`)
      .emit('recMessage', message);

    // 3. แจ้งเตือน Client ทั้งหมด (โดยเฉพาะหน้า Admin) ว่ามีแชทอัปเดต
    this.server.emit('conversationUpdated');
  }

  // Client เข้าร่วมห้องแชท
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, conversationId: string) {
    client.join(`conversation_${conversationId}`);
    // this.logger.log(
    //   `Client ${client.id} joined room: conversation_${conversationId}`,
    // );
  }

  afterInit(server: Server) {
    // this.logger.log('WebSocket Gateway Initialized');
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    // this.logger.log(`Client connected: ${client.id}`);
    // ที่จุดนี้ คุณสามารถทำ Authentication เพื่อระบุตัวตน user จาก client.handshake.headers.authorization ได้
  }
}
