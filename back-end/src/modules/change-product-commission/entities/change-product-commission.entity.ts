import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { ProductModel } from 'src/modules/product-model/entities/product-model.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';

@Entity()
export class ChangeProductCommission {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 'Com202409070001' })
  @Column({ default: 'Com202409070001' })
  code: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productModelId: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productStorageId: number;

  @ManyToOne(() => ProductModel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productModelId' })
  productModel?: ProductModel;

  @ApiProperty({ default: 0 })
  @Column({ default: 1 })
  priceCommission: number;

  @ApiProperty({ default: 'มือสอง' })
  @Column({ default: 'มือสอง' })
  hand: string;

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
}
