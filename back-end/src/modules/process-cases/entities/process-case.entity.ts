import {
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Entity,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ProcessCaseImage } from 'src/modules/process-case-images/entities/process-case-image.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';

@Entity()
export class ProcessCase {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sumPrice: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sumPricePay: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  sumPriceDebt: number;

  // ส่วนลด (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDiscount: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDebt: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceRemaining: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEndCase: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReRider: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipSum: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePayRider: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReturnCustomer: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  valueMonth?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  valueDebtMonth?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceCostBuy: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceNewCostBuy: number;

  // ยอดวางดาวน์ (%)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDownPayment: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productSaleId?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: null, nullable: true })
  oldProductId?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: null, nullable: true })
  newProductId?: number;

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

  @ApiProperty({ default: 1 })
  @Column({
    default: 1,
    comment:
      '1 = จบสัญญาแบบไม่มียอดค้าง 2 = จบสัญญาแบบมียอดค้าง 3 = คืนสัญญา 4 = ยึดสัญญา 5 = เครมเครื่อง',
  })
  caseType?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note: string;

  @ApiProperty({ default: 'จบสัญญาแบบไม่มียอดค้าง' })
  @Column({ default: 'จบสัญญาแบบไม่มียอดค้าง' })
  caseStatus?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  useCostType?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  payType?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  status?: string;

  @OneToMany(
    () => ProcessCaseImage,
    (processCaseImage) => processCaseImage.processCase,
  )
  processCaseImages?: ProcessCaseImage[];

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;
}
