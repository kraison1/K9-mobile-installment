import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductModel } from 'src/modules/product-model/entities/product-model.entity';
import { Bank } from 'src/modules/banks/entities/bank.entity';
import { ProductRepairImage } from 'src/modules/product-repair-image/entities/product-repair-image.entity';
import { ProductRepairList } from 'src/modules/product-repair-lists/entities/product-repair-list.entity';

@Entity()
export class ProductRepair {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 'RPB1202409070001' })
  @Column({ default: 'RPB1202409070001' })
  code: string;

  @ApiProperty({ default: '', nullable: true })
  @Column({ default: '', nullable: true })
  imei: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  productId?: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceRepair: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceWage: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceTransferCash: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceCost: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceCash: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  pricePredict: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceProfit: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  mobilePriceCost: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceDiscount: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceEquipCost: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceEquipSum: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceEquipProfit: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  updateByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'updateByUserId' })
  updateBy?: User;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  shopName?: string;

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

  @ApiProperty({ default: null, nullable: true })
  @Column({ default: null, nullable: true })
  productModelId?: number;

  @ManyToOne(() => ProductModel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productModelId' })
  productModel?: ProductModel;

  @ApiProperty({ default: null, nullable: true })
  @Column({ default: null, nullable: true })
  productBrandId?: number;

  @ApiProperty({ default: null, nullable: true })
  @Column({ default: null, nullable: true })
  productTypeId?: number;

  @ApiProperty({ default: '2' })
  @Column({
    default: '2',
    comment:
      ' 1=เครื่องหน้าร้าน, 2=ลูกค้าหน้าร้าน, 3=ร้านค้าส่งซ่อม, 4=ส่งร้านค่าซ่อม',
  })
  typeRepair?: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  bankId: number;

  @ManyToOne(() => Bank, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
    comment: ' 1=ยืนยัน, 2=ยกเลิก',
  })
  active?: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
  })
  randomCode?: string;

  @ApiProperty({ default: '' })
  @Column({
    default: '',
    nullable: true,
  })
  payType?: string;

  @OneToMany(() => ProductRepairList, (list) => list.productRepair)
  productRepairLists?: ProductRepairList[];

  @OneToMany(() => ProductRepairImage, (list) => list.productRepair)
  productRepairImages?: ProductRepairImage[];
}
