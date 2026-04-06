import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { UserGroup } from 'src/modules/user-groups/entities/user-group.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Conversation } from 'src/modules/chat/entities/conversation.entity';
import { Message } from 'src/modules/chat/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  username: string;

  @ApiProperty({ default: '' })
  @Column()
  password: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({ default: '' })
  @Column()
  name: string;

  @ApiProperty({ default: '' })
  @Column()
  lastname: string;

  @ApiProperty({ default: '' })
  @Column()
  tel: string;

  @ApiProperty({ default: '' })
  @Column()
  bookno: string;

  @ApiProperty({ default: '' })
  @Column()
  bookbank: string;

  @ApiProperty({ default: '' })
  @Column()
  bookname: string;

  @ApiProperty({ default: '1' })
  @Column()
  active: string;

  @ApiProperty({ default: '' })
  @Column()
  branchId: number;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  firebaseToken: string;

  @ApiProperty({ default: 'พนักงาน' })
  @Column({ default: 'พนักงาน' })
  type: string;

  @ApiProperty({ default: 'website' })
  @Column({ default: 'website' })
  deviceType?: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ApiProperty({ default: '' })
  @Column()
  userGroupId: number;

  @ManyToOne(() => UserGroup, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userGroupId' })
  userGroup: UserGroup;

  @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @ManyToOne(() => Branch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;
}
