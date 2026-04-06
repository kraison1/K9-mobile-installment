import { ApiProperty } from '@nestjs/swagger';
import { ProductSaving } from 'src/modules/product-saving/entities/product-saving.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ProductSavingImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productSavingId: number;

  @ManyToOne(() => ProductSaving, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSavingId' })
  productSaving?: ProductSaving;

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
