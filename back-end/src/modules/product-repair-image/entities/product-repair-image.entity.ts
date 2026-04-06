import { ApiProperty } from '@nestjs/swagger';
import { ProductRepair } from 'src/modules/product-repair/entities/product-repair.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ProductRepairImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productRepairId: number;

  @ManyToOne(() => ProductRepair, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productRepairId' })
  productRepair?: ProductRepair;

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
