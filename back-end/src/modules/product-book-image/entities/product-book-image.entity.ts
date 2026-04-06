import { ApiProperty } from '@nestjs/swagger';
import { ProductBook } from 'src/modules/product-book/entities/product-book.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ProductBookImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productBookId: number;

  @ManyToOne(() => ProductBook, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBookId' })
  productBook?: ProductBook;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  userId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
