import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ProductPayMentList } from 'src/modules/product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';

@Entity()
export class ProductPaymentImage {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({
    default: 1,
  })
  payNo: number;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    nullable: true,
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  datePay?: Date;

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
  productSaleId?: number;

  @ManyToOne(() => ProductSale, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSaleId' })
  productSale?: ProductSale;

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

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productPayMentListId?: number;

  @ManyToOne(() => ProductPayMentList, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productPayMentListId' })
  productPayMentLists?: ProductPayMentList;

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
  filePayMent?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  active?: string;
}
