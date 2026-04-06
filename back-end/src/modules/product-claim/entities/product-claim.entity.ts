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
import { Branch } from 'src/modules/branchs/entities/branch.entity';

@Entity()
export class ProductClaim {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
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
  })
  priceCostBuy?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  amount?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  branchId?: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: '0' })
  @Column({ default: '0' })
  status?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  createByUserId?: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  updateByUserId?: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'updateByUserId' })
  update_by?: User;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
