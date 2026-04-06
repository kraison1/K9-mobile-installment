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
import { ProcessBookImage } from 'src/modules/process-book-images/entities/process-book-image.entity';
import { ProductBook } from 'src/modules/product-book/entities/product-book.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';

@Entity()
export class ProcessBook {
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

  @ApiProperty({ default: 1 })
  @Column({
    default: 1,
    comment:
      '1 = ยึดมัดจำ 2 = คืนมัดจำ 3 = ค่าเปิดใช้เครื่อง 4 = เปลื่ยนเป็นออม',
  })
  bookType?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  note: string;

  @ApiProperty({ default: 'ยึดมัดจำ' })
  @Column({ default: 'ยึดมัดจำ' })
  bookStatus?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productBookId?: number;

  @ManyToOne(() => ProductBook, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBookId' })
  productBook?: ProductBook;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  payType?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  status?: string;

  @OneToMany(
    () => ProcessBookImage,
    (processBookImage) => processBookImage.processBook,
  )
  processBookImages?: ProcessBookImage[];

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;
}
