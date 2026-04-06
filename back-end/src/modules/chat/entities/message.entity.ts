// src/chat/entities/message.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  // เก็บข้อความ หรือ path ของรูปภาพ
  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @ManyToOne(() => User, (user) => user.messages, {
    createForeignKeyConstraints: false,
  })
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    createForeignKeyConstraints: false,
  })
  conversation: Conversation;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
