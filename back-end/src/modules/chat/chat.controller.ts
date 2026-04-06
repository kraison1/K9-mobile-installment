// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  BadRequestException,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly baseUploadsPath = 'uploads/chat-images';

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // Endpoint for mobile app to initialize a chat and get a stable conversation ID
  @Post('conversation/init')
  async initConversation(@Req() req) {
    // req.user should be populated by JwtAuthGuard from the token
    const userId = req.user.id;
    const conversation = await this.chatService.initConversation(userId);
    // Return the stable conversation ID
    return { id: conversation.id, code: conversation.code };
  }

  // Endpoint สำหรับดึงรายการแชททั้งหมดสำหรับหน้า Admin
  @Get('conversations')
  getAllConversations(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: FastifyRequest,
  ) {
    return this.chatService.getAllConversations(
      Number(page),
      Number(limit),
      req,
    );
  }

  // Endpoint สำหรับดึงประวัติแชท
  @Get('conversation/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: FastifyRequest,
  ) {
    return this.chatService.getMessagesForConversation(
      Number(id),
      Number(page),
      Number(limit),
      req,
    );
  }

  // Endpoint สำหรับส่งข้อความ (สำหรับทดสอบผ่าน Postman)
  @Post('message')
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    // 1. บันทึกข้อความลง DB
    const message = await this.chatService.createMessage(createMessageDto);

    // 2. ส่งข้อความกลับไปยัง Client ที่อยู่ในห้องแชทผ่าน WebSocket
    this.chatGateway.server
      .to(`conversation_${message.conversation.id}`)
      .emit('recMessage', message);

    return message;
  }

  // Endpoint สำหรับอัปโหลดรูปภาพ
  @Post('upload/image')
  async uploadImage(
    @Req() req: FastifyRequest,
    @Query('conversationId') customerId: string,
  ) {
    if (!customerId) {
      throw new BadRequestException(
        'conversationId (as customerId) is required.',
      );
    }

    // The user is right, this was the error. `conversationId` from the client is the customer's ID.
    // We now find or create the conversation based on this ID to get its unique code for the folder name.
    const conversationCode =
      await this.chatService.findOrCreateConversationCode(+customerId);

    const conversationPath = path.join(this.baseUploadsPath, conversationCode);

    await fs.ensureDir(conversationPath);
    const files = await req.saveRequestFiles();

    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded.');
    }

    const file = files[0];
    const buffer = await fs.readFile(file.filepath);

    const filename = `${generateRandomString(6)}.png`;
    const destinationPath = path.join(conversationPath, filename);

    await sharp(buffer)
      .png({ quality: 80, progressive: true })
      .toFile(destinationPath);

    // คืนค่าเป็น path ของไฟล์ที่อัปโหลด
    // Frontend จะนำ path นี้ไปส่งผ่าน WebSocket ต่อไป
    return {
      filePath: `/${this.baseUploadsPath}/${conversationCode}/${filename}`,
    };
  }
}
