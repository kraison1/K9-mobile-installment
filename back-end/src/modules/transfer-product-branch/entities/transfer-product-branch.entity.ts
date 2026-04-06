import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { TransferProductBranchList } from 'src/modules/transfer-product-branch-lists/entities/transfer-product-branch-list.entity';
import { Transport } from 'src/modules/transport/entities/transport.entity';

@Entity()
export class TransferProductBranch {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: "มือถือ" })
  @Column({ default: 'มือถือ' })
  catalog: string;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  code: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  refOldStockNumber: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  tackingNumber: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  branchId?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  toBranchId?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
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

  @ApiProperty({ default: 1 })
  @Column({ default: 0, nullable: true })
  transportId: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 0 })
  priceSumAll: number;

  @ManyToOne(() => Transport, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'transportId' })
  transport?: Transport;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ default: '0' })
  @Column({
    default: '0',
    comment: '0 = รอ, 1 = ยืนยัน, 2 = ปฏิเสธ, 3 = ยกเลิก',
  })
  status?: string;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'toBranchId' })
  toBranch?: Branch;

  // เพิ่มความสัมพันธ์ OneToMany
  @OneToMany(
    () => TransferProductBranchList,
    (list) => list.transferProductBranch,
  )
  transferProductBranchLists?: TransferProductBranchList[];

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileTransferProductBranch?: string;
}
