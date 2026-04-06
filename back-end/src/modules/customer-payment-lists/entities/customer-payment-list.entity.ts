import { ApiProperty } from '@nestjs/swagger';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { ProcessSaving } from 'src/modules/process-savings/entities/process-saving.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductSaving } from 'src/modules/product-saving/entities/product-saving.entity';

@Entity()
export class CustomerPaymentList {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  code: string;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  price: number;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  bankId?: number;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  productSaleId?: number;

  @ManyToOne(() => ProductSale, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSaleId' })
  productSale?: ProductSale;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  productSavingId: number;

  @ManyToOne(() => ProductSaving, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSavingId' })
  productSaving?: ProductSaving;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  userId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  filePayment: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, comment: '1 = ผ่อนรายเดือน 2 = ออม' })
  type: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  status: string;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    nullable: true,
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  approve_date?: Date;
}
