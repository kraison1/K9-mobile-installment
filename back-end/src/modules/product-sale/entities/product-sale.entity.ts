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
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Transport } from 'src/modules/transport/entities/transport.entity';
import { ProductSaleList } from 'src/modules/product-sale-lists/entities/product-sale-list.entity';
import { ProductPayMentList } from 'src/modules/product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { ProductSaleImage } from 'src/modules/product-sale-images/entities/product-sale-image.entity';
import { ProcessManageFinance } from 'src/modules/process-manage-finance/entities/process-manage-finance.entity';
import { ProductPaymentImage } from 'src/modules/product-payment-images/entities/product-payment-image.entity';
import { ProcessBook } from 'src/modules/process-books/entities/process-book.entity';
import { ProcessSaving } from 'src/modules/process-savings/entities/process-saving.entity';
import { ProductBook } from 'src/modules/product-book/entities/product-book.entity';
import { ProductSaving } from 'src/modules/product-saving/entities/product-saving.entity';

@Entity()
export class ProductSale {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '20250226ST1B10001' })
  @Column({ default: '20250226ST1B10001' })
  code: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  shopAppID: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  shopPass: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  shopPin: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  rentAppID: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  rentPass: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  rentPin: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  isMobileSale: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1', nullable: true })
  isClaim: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  productBookId: number;

  @OneToOne(() => ProductBook, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBookId' })
  productBook?: ProductBook;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  processManageFinanceId: number;

  @OneToOne(() => ProcessManageFinance, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'processManageFinanceId', referencedColumnName: 'id' })
  processManageFinance?: ProcessManageFinance;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  productSavingId: number;

  @OneToOne(() => ProductSaving, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSavingId' })
  productSaving?: ProductSaving;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  payType: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceCash: number;

  @ApiProperty({ default: '0' })
  @Column({
    default: '0',
  })
  isCancel: string;

  @ApiProperty({ default: '4' })
  @Column({
    default: '4',
    comment:
      '1 = สำเร็จ 2 = ถึงเวลาชำระ 3 = มียอดค้างชำระ 4 = ยังไม่ถึงเวลาจ่ายค่างวด 5 = คืนสัญญา 6 = ยึดสัญญา 7 = ครบสัญญา 8 = ติดตามเครื่อง 9 = หนี้เสีย',
  })
  isPaySuccess: string;

  @ApiProperty({ default: 'มือสอง' })
  @Column({ default: 'มือสอง', nullable: true })
  hand: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payPerMonth: number;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  useCalType: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '0' })
  isCash: string;

  // ต้นทุนเครื่อง
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceCostBuy: number;

  // ราคาขาย
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSale: number;

  // ยอดวางดาวน์
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceAdjusted: number;

  // ส่วนลด (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDiscount: number;

  // รวมยอดที่จ่ายก่อนรับ (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceTotalPaid: number;

  // กำไรเทียม (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSomeProfit: number;

  // กำไร (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceProfit: number;

  // รวมราคาจัด (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSumAdjusted: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSumInvoices: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceSumPayInvoices: number;

  // ยอดวางดาวน์ (%)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDownPayment: number;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBank?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBankName?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBankNo?: string;

  // รับค่าส่ง (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReRider: number;

  // รับค่าส่งจากลูกค้า
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReRiderCustomer: number;

  // ยอดก่อนจัด
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceBeforeAdjusted: number;

  // AppleID (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceRegAppleId: number;

  // บริการอื่น ๆ (บ.)
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceETC: number;

  // ต้นทุนอุปกรณ์
  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipCost: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipProfit: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipSum: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceEquipCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReRiderTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReRiderCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceRegAppleIdTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceRegAppleIdCash: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceRepair: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReseller: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  valueMonth?: number;

  @ApiProperty({ default: 1 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valueEqual?: number;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  rateFinanceId?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  tackingNumber: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 0, nullable: true })
  transportId: number;

  @ManyToOne(() => Transport, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'transportId' })
  transport?: Transport;

  @ApiProperty({ default: '1' })
  @Column()
  priceType?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1', nullable: true })
  randomCode?: string;

  @ApiProperty({ default: '1' })
  @Column()
  saleType?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  note?: string;

  @ApiProperty({ default: '2' })
  @Column({ default: '2', nullable: true })
  priceDownType?: string;

  @ApiProperty({ default: 1 })
  @Column({ default: null, nullable: true })
  productId: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  resellerId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'resellerId' })
  reseller?: Customer;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  customerMirrorId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerMirrorId' })
  customerMirror?: Customer;

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

  @OneToMany(() => ProductSaleList, (list) => list.productSale)
  productSaleLists?: ProductSaleList[];

  @OneToMany(() => ProductPayMentList, (list) => list.productSale)
  productPayMentLists?: ProductPayMentList[];

  @OneToMany(() => ProductSaleImage, (list) => list.productSale)
  productSaleImages?: ProductSaleImage[];

  @OneToMany(() => ProductPaymentImage, (list) => list.productSale)
  productPaymentImages?: ProductPaymentImage[];

  @ApiProperty()
  @Column({
    type: 'date',
    nullable: true,
    default: () => "(NOW() AT TIME ZONE 'Asia/Bangkok')::date",
  })
  caseDate?: Date;
}
