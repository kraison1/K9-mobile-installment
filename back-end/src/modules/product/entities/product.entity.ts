import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { ProductBrand } from 'src/modules/product-brands/entities/product-brand.entity';
import { ProductColor } from 'src/modules/product-colors/entities/product-color.entity';
import { ProductImage } from 'src/modules/product-image/entities/product-image.entity';
import { ProductLog } from 'src/modules/product-log/entities/product-log.entity';
import { ProductModel } from 'src/modules/product-model/entities/product-model.entity';
import { ProductRepair } from 'src/modules/product-repair/entities/product-repair.entity';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { ProductStorage } from 'src/modules/product-storages/entities/product-storage.entity';
import { ProductType } from 'src/modules/product-types/entities/product-type.entity';
import { TransferProductBranchList } from 'src/modules/transfer-product-branch-lists/entities/transfer-product-branch-list.entity';
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
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: 'มือถือ' })
  @Column({ default: 'มือถือ' })
  catalog?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  code: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  refOldStockNumber?: string;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  payPerMonth?: number;

  @ApiProperty({ default: '' })
  @Column({ default: 0, nullable: true })
  valueMonth: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  imei: string;

  @ApiProperty({ default: 100 })
  @Column({ default: 100, nullable: true })
  batteryHealth: number;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  shopInsurance: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  shopCenterInsurance: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  lotNumber: string;

  @ApiProperty()
  @Column({
    type: 'date',
    nullable: true,
    default: () => "(NOW() AT TIME ZONE 'Asia/Bangkok')::date",
  })
  shopCenterInsuranceDate?: Date;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  randomCode: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  simType: string;

  @ApiProperty({ default: 'มือสอง' })
  @Column({ default: 'มือสอง', nullable: true })
  hand: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  simName: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  boxType: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  buyFormShop: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0', nullable: true })
  freeGift: string;

  @ApiProperty({ default: 95 })
  @Column({ default: 95, nullable: true })
  machineCondition: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceCostBuy: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceWholeSale: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSale: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSumSale: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSumWithdraw: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceDownPayment: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amountSale: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amountFree: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amountClaim: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amountWithdraw: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amountRemaining: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceDownPaymentPercent: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceRepair: number;

  @ApiProperty({ default: 300 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 300,
  })
  priceCommission: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceReRider: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceRegAppleId: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceETC: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0, nullable: true })
  amount: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productTypeId: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileProduct?: string;

  @ManyToOne(() => ProductType, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productTypeId' })
  productType?: ProductType;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productColorId: number;

  @ManyToOne(() => ProductColor, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productColorId' })
  productColor?: ProductColor;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productStorageId: number;

  @ManyToOne(() => ProductStorage, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productStorageId' })
  productStorage?: ProductStorage;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productBrandId: number;

  @ManyToOne(() => ProductBrand, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBrandId' })
  productBrand?: ProductBrand;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productModelId: number;

  @ManyToOne(() => ProductModel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productModelId' })
  productModel?: ProductModel;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 1 })
  @Column({ default: null, nullable: true })
  updateByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'updateByUserId' })
  updateBy?: User;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
    comment:
      '0=ปิดใช้งาน, 1=พร้อมขาย, 3=มีในสัญญา, 4=ขายสด, 6=จอง, 7=มีในออม, 8=ซ่อม, 9=ใช้ภายใน, 10=เครื่องคืน, 11=เครื่องยึด',
  })
  active?: string;

  @ApiProperty({ required: false })
  @Column({ default: '', nullable: true })
  returnShopForm?: string;

  @ApiProperty({ required: false })
  @Column({ default: '', nullable: true })
  returnCustomerForm?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  customerId?: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  venderId?: number;

  @ApiProperty({ required: false })
  @Column({ default: '0', nullable: true })
  isFinance?: string;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'venderId' })
  vender?: Customer;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  productImages?: ProductImage[];

  // @OneToMany(() => ProductSale, (productSale) => productSale.product)
  productSaleLatest?: ProductSale;
  productReturnSaleLatest?: ProductSale;

  @OneToMany(() => ProductRepair, (productRepair) => productRepair.product)
  productRepairs?: ProductRepair[];

  @OneToMany(
    () => TransferProductBranchList,
    (transferProductBranchList) => transferProductBranchList.product,
  )
  transferProductBranchList?: TransferProductBranchList[];

  @OneToMany(() => ProductLog, (productLog) => productLog.product)
  productLog?: ProductLog[];
}
