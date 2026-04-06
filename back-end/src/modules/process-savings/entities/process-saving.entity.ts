import {
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Entity,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { ProcessSavingImage } from 'src/modules/process-saving-images/entities/process-saving-image.entity';
import { ProductSaving } from 'src/modules/product-saving/entities/product-saving.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';

@Entity()
export class ProcessSaving {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sumPrice: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceReturnCustomer: number;

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

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  payType?: string;

  @ApiProperty({ default: 1 })
  @Column({
    default: 1,
    comment: '1 = ยึดมัดจำ 2 = คืนมัดจำ',
  })
  savingType?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note: string;

  @ApiProperty({ default: 'ยึดมัดจำ' })
  @Column({ default: 'ยึดมัดจำ' })
  savingStatus?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productSavingId?: number;

  @ManyToOne(() => ProductSaving, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSavingId' })
  productSaving?: ProductSaving;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  status?: string;

  @OneToMany(
    () => ProcessSavingImage,
    (processSavingImage) => processSavingImage.processSaving,
  )
  processSavingImages?: ProcessSavingImage[];

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;
}
