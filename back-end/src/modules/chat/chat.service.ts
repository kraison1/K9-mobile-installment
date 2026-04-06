// src/chat/chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Not, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-chat.dto';
import { generateRandomString } from 'src/helper/generateRandomString';
import { FirebaseService } from '../firebase/firebase.service';
import { FastifyRequest } from 'fastify';
import { ProductSale } from '../product-sale/entities/product-sale.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    private readonly firebaseService: FirebaseService,
  ) {}

  private async _findOrCreateConversation(
    conversationIdOrUserId: string | number,
    sender: User,
  ): Promise<Conversation> {
    let conversation: Conversation;
    let needsSave = false;

    // 1. Try to find by conversation ID
    conversation = await this.conversationRepository.findOne({
      where: { id: +conversationIdOrUserId },
      relations: ['participants'],
    });

    // 2. If not found, assume it's a user ID and find/create by participant
    if (!conversation) {
      const customer = await this.userRepository.findOneBy({
        id: +conversationIdOrUserId,
      });
      if (!customer) {
        throw new NotFoundException(
          `User/Conversation with ID ${conversationIdOrUserId} not found.`,
        );
      }

      conversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .innerJoinAndSelect('conversation.participants', 'user')
        .where('user.id = :userId', { userId: customer.id })
        .getOne();

      if (!conversation) {
        // Create a new conversation if it doesn't exist
        conversation = this.conversationRepository.create({
          code: generateRandomString(12),
          participants: [customer],
        });
        needsSave = true;
      }
    }

    // 3. Ensure sender is a participant
    const isSenderParticipant = conversation.participants.some(
      (p) => p.id === sender.id,
    );
    if (!isSenderParticipant) {
      conversation.participants.push(sender);
      needsSave = true;
    }

    // 4. Save only if changes were made (creation or new participant)
    if (needsSave) {
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, type, senderId, conversationId } = createMessageDto;

    // 1. Find sender
    const sender = await this.userRepository.findOneBy({ id: +senderId });
    if (!sender) {
      throw new NotFoundException(`Sender with ID ${senderId} not found.`);
    }

    // 2. Find or create conversation and add sender if needed (handles DB saves internally)
    const conversation = await this._findOrCreateConversation(
      conversationId,
      sender,
    );

    // 3. Send push notifications concurrently to relevant participants (customers)
    const notificationPromises = conversation.participants
      .filter(
        (p) => p.id !== sender.id && p.type === 'ลูกค้า' && p.firebaseToken,
      )
      .map((participant) => {
        const title = 'แจ้งเตือน';
        const body = type === 'text' ? content : 'มีรูปภาพใหม่เข้ามา';
        return this.firebaseService.sendPushNotification(
          participant.firebaseToken,
          title,
          body,
        );
      });

    await Promise.all(notificationPromises);

    // 4. Create and save the new message
    const message = this.messageRepository.create({
      content,
      type,
      sender,
      conversation,
    });
    const savedMessage = await this.messageRepository.save(message);

    // 5. Trigger an update on the conversation to refresh its `updatedAt` timestamp.
    // This ensures the conversation is marked as recently active.
    await this.conversationRepository.update(conversation.id, {});

    // 6. Return the full message object for the client, ensuring all needed relations are loaded.
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: {
        sender: true,
        conversation: true,
      },
      select: {
        id: true,
        content: true,
        type: true,
        create_date: true,
        sender: {
          id: true,
          name: true,
          username: true,
          type: true,
        },
        conversation: {
          id: true,
        },
      },
    });
  }

  async getMessagesForConversation(
    conversationId: number,
    page: number,
    limit: number,
    req: FastifyRequest,
  ): Promise<{ data: Message[]; total: number }> {
    const user = (req as any).user;
    let newConversationId = conversationId;

    if (user.type != 'ลูกค้า') {
      // Find the conversation associated with the user ID

      const conversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .innerJoin('conversation.participants', 'user', 'user.id = :userId', {
          userId: conversationId,
        })
        .getOne();
      newConversationId = conversation.id;
      // console.log('customerId', customerId);
      // If no conversation exists, return an empty array of messages.
      if (!conversation) {
        return { data: [], total: 0 };
      }
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversation: { id: newConversationId } },
      order: { create_date: 'DESC' }, // ดึงข้อความล่าสุดก่อน
      take: limit,
      skip: skip,
      relations: {
        sender: true,
      },
      select: {
        id: true,
        content: true,
        type: true,
        create_date: true,
        sender: {
          id: true,
          name: true,
          username: true,
          type: true,
        },
      },
    });

    return { data: messages, total };
  }

  // This method now finds or creates a conversation based on the customer's ID
  // and returns the conversation's unique code for the folder name.
  async findOrCreateConversationCode(customerId: number): Promise<string> {
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user', 'user.id = :userId', {
        userId: customerId,
      })
      .getOne();

    if (!conversation) {
      const customer = await this.userRepository.findOneBy({ id: customerId });
      if (!customer) {
        throw new Error(
          `User with ID ${customerId} not found, cannot create conversation.`,
        );
      }
      conversation = this.conversationRepository.create({
        code: generateRandomString(12),
        participants: [customer],
      });
      await this.conversationRepository.save(conversation);
    }

    if (!conversation.code) {
      conversation.code = generateRandomString(12);
      await this.conversationRepository.save(conversation);
    }

    return conversation.code;
  }

  async getAllConversations(
    page: number,
    limit: number,
    req: FastifyRequest,
  ): Promise<{ data: any[]; total: number }> {
    const user = (req as any).user;

    const skip = (page - 1) * limit;
    const findOptions: FindManyOptions<Conversation> = {
      relations: ['participants'],
      order: { updatedAt: 'DESC' }, // Order by most recently updated
      take: limit,
      skip: skip,
      select: {
        id: true,
        updatedAt: true,
        participants: {
          id: true,
          name: true,
          lastname: true,
          tel: true,
          type: true,
          username: true,
          customerId: true,
        },
      },
    };

    // สร้าง where clause แบบไดนามิกเพื่อความยืดหยุ่น
    const whereClause: any = {};
    const participantConditions: any = {};

    // เงื่อนไขหลัก: ดึงเฉพาะห้องแชทที่มีผู้เข้าร่วมเป็น 'ลูกค้า'
    participantConditions.type = 'ลูกค้า';

    // Conditionally add the where clause based on the environment variable and user's branch.
    if (process.env.SYSTEM_BY === 'AAA' && user.branchId) {
      participantConditions.branchId = user.branchId;
    }

    if (Object.keys(participantConditions).length > 0) {
      whereClause.participants = participantConditions;
    }

    if (Object.keys(whereClause).length > 0) {
      findOptions.where = whereClause;
    }

    const [conversations, total] =
      await this.conversationRepository.findAndCount(findOptions);

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { conversation: { id: conv.id } },
          order: { create_date: 'DESC' },
          relations: ['sender'],
          select: {
            id: true,
            content: true,
            create_date: true,
            sender: {
              id: true,
              name: true,
              username: true,
              type: true,
            },
          },
        });

        const customer = conv.participants.find((p) => p.type === 'ลูกค้า');

        let productSaleCode = '';
        if (customer && customer.customerId) {
          // Find the latest, active, non-cancelled contract for this customer
          const productSale = await this.productSaleRepository.findOne({
            where: {
              customerId: customer.customerId,
            },
            order: { create_date: 'DESC' },
            select: ['code'],
          });
          if (productSale) {
            productSaleCode = productSale.code;
          }
        }

        const adminHasReplied = lastMessage
          ? lastMessage.sender.type !== 'ลูกค้า'
          : true;

        return {
          id: conv.id,
          updatedAt: conv.updatedAt,
          customer: customer
            ? {
                id: customer.id,
                code: productSaleCode,
                name: `${customer.name} ${customer.lastname}`,
              }
            : { id: 0, name: 'ลูกค้าไม่ระบุชื่อ', code: null },
          lastMessage: lastMessage,
          adminHasReplied,
        };
      }),
    );

    return { data: enrichedConversations, total };
  }

  async initConversation(userId: number): Promise<Conversation> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Find an existing conversation where this user is a participant.
    // This assumes a customer has only one primary conversation thread.
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .getOne();

    if (!conversation) {
      // If no conversation exists for this customer, create a new one.
      conversation = this.conversationRepository.create({
        code: generateRandomString(12),
        participants: [user],
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }
}
