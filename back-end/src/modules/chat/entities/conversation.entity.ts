// src/chat/entities/conversation.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  code: string;

  @ManyToMany(() => User, (user) => user.conversations, {
    createForeignKeyConstraints: false,
  })
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation, {
    createForeignKeyConstraints: false,
  })
  messages: Message[];

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
