import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class BranchTransferPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  code: string;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  bankId: number;

  @ApiProperty({ default: '1' })
  @Column({ default: null, nullable: true })
  infoBank?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: null, nullable: true })
  fromInfoBank?: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  fromBankId: number;

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
  fromBranchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'fromBranchId' })
  fromBranch?: Branch;

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
  @Column({
    default: '',
    nullable: true,
  })
  note?: string;

  @ApiProperty({ default: '1' })
  @Column({
    default: '1',
  })
  status?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  filePrice?: string;
}
