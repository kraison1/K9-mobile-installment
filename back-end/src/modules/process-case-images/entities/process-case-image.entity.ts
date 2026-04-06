import { ApiProperty } from '@nestjs/swagger';
import { ProcessCase } from 'src/modules/process-cases/entities/process-case.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ProcessCaseImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  processCaseId: number;

  @ManyToOne(() => ProcessCase, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'processCaseId' })
  processCase?: ProcessCase;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  userId: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  seq: number;

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
