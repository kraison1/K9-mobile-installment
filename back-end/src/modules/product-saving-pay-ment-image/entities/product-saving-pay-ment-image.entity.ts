import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { ProductSaving } from 'src/modules/product-saving/entities/product-saving.entity';

@Entity()
export class ProductSavingPayMentImage {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productSavingId?: number;

  @ManyToOne(() => ProductSaving, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSavingId' })
  productSaving?: ProductSaving;

  @ApiProperty({ default: 0 })
  @Column({
    default: 1,
  })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: 0 })
  @Column({
    default: null,
    nullable: true,
  })
  bankId: number;

  @ManyToOne(() => Bank, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @ApiProperty({ default: '2' })
  @Column({
    default: '2',
  })
  payType: string;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ default: 1 })
  @Column({ default: null, nullable: true })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileSavingPayMent?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  active?: string;
}
