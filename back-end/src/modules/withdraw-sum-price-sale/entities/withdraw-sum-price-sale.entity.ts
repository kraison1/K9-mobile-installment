import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class WithdrawSumPriceSale {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  branchId?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productId?: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  code: string;

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
  priceSale: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSum: number;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  note: string;

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

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  status: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  active: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileWithdrawSumPriceSale?: string;
}
