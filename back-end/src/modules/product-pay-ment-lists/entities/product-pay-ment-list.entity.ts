import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { ProductPaymentImage } from 'src/modules/product-payment-images/entities/product-payment-image.entity';

@Entity()
export class ProductPayMentList {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({
    default: 1,
  })
  payNo: number;

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

  @ApiProperty()
  @Column({
    type: 'timestamptz', // ← เปลี่ยนจาก 'date'
    nullable: true,
    default: () => 'now()', // ให้ DB ใส่เวลา ณ ขณะสร้าง ถ้าไม่ส่งมา
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
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  pricePay: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceDebt: number;

  @ApiProperty({ default: '4' })
  @Column({
    default: '4',
    comment:
      '1 = สำเร็จ 2 = ถึงเวลาชำระ 3 = มียอดค้างชำระ 4 = ยังไม่ถึงเวลาจ่ายค่างวด',
  })
  isPaySuccess: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
    comment: '0 = ยกเลิก 1 = ยังไม่ยกเลิก',
  })
  isCaseSuccess: string;

  @ApiProperty({ default: '' })
  @Column({
    default: '',
    nullable: true,
  })
  note: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productSaleId?: number;

  @ManyToOne(() => ProductSale, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSaleId' })
  productSale?: ProductSale;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @OneToMany(() => ProductPaymentImage, (image) => image.productPayMentLists)
  productPaymentImages?: ProductPaymentImage[];
}
