import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { ProductSavingImage } from 'src/modules/product-saving-images/entities/product-saving-image.entity';
import { ProductSavingPayMentImage } from 'src/modules/product-saving-pay-ment-image/entities/product-saving-pay-ment-image.entity';
import { ProcessSaving } from 'src/modules/process-savings/entities/process-saving.entity';

@Entity()
export class ProductSaving {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  code: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  payType: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  priceTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  priceCash: number;

  @ApiProperty({ default: 1 })
  @Column({ default: null, nullable: true })
  productId: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  createByUserId: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSumPay: number;

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

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @OneToMany(() => ProcessSaving, (ps) => ps.productSaving, {
    createForeignKeyConstraints: false,
  })
  processSavings?: ProcessSaving[];

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  bankId: number;

  @ManyToOne(() => Bank, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productBookId?: number;

  @OneToMany(() => ProductSavingImage, (list) => list.productSaving)
  productSavingImages?: ProductSavingImage[];

  @OneToMany(() => ProductSavingPayMentImage, (list) => list.productSaving)
  productSavingPayMentImage?: ProductSavingPayMentImage[];

  @ApiProperty({ default: '0' })
  @Column({
    default: '0',
  })
  isCancel: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  note?: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
    comment: '1=ออมอยู่, 2=ยึดออม, 3=คืนออม, 4=ชำระเปิดใช้เตรื่อง',
  })
  status?: string;
}
