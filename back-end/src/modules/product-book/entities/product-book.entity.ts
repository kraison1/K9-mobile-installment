import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { ProductBookImage } from 'src/modules/product-book-image/entities/product-book-image.entity';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { ProcessBook } from 'src/modules/process-books/entities/process-book.entity';

@Entity()
export class ProductBook {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '20250226ST1B10001' })
  @Column({ default: '20250226ST1B10001' })
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

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  bankId: number;

  @ManyToOne(() => Bank, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @ApiProperty()
  @Column({
    type: 'date',
    nullable: true,
    default: () => "(NOW() AT TIME ZONE 'Asia/Bangkok')::date",
  })
  caseDate?: Date;

  @OneToMany(() => ProductBookImage, (list) => list.productBook)
  productBookImages?: ProductBookImage[];

  @OneToMany(() => ProcessBook, (pb) => pb.productBook, {
    createForeignKeyConstraints: false,
  })
  processBooks?: ProcessBook[];

  @ManyToOne(() => ProductSale, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBookId' })
  productSale?: ProductSale;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  note?: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
    comment:
      '1=มัดจำอยู่, 2=ยึดมัดจำ, 3=คืนมัดจำ, 4=ชำระเปิดใช้เตรื่อง, 5=ออมเปิดใช้เครื่อง,',
  })
  status?: string;
}
