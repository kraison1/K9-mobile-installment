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
export class ManageAppleId {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  appId?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  pass?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note?: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  branchId: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 0 })
  count: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

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
  @Column({
    default: '1',
  })
  active?: string;
}
