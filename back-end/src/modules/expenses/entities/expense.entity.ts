import { ApiProperty } from '@nestjs/swagger';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { ExpenseImage } from 'src/modules/expense-images/entities/expense-image.entity';
import { ExpenseType } from 'src/modules/expense-types/entities/expense-type.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  code: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ default: '1' })
  @Column()
  type?: string;

  @ApiProperty({ default: '' })
  @Column()
  expenseTypeId: number;

  @ManyToOne(() => ExpenseType, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'expenseTypeId' })
  expenseType?: ExpenseType;

  @OneToMany(() => ExpenseImage, (expenseImage) => expenseImage.expense)
  expenseImages?: ExpenseImage[];

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  bankId: number;

  @ManyToOne(() => Bank, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  payType: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
  })
  active?: string;

  @ApiProperty({ default: '' })
  @Column({
    default: '',
    nullable: true,
  })
  note?: string;

  // @ApiProperty({ required: false })
  // @Column({ nullable: true })
  // fileExpense?: string;
}
