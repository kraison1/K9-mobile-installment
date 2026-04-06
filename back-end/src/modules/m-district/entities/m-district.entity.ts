import { ApiProperty } from '@nestjs/swagger';
import { MProvince } from 'src/modules/m-province/entities/m-province.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class MDistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ default: '' })
  @Column()
  provinceId: number;

  @ManyToOne(() => MProvince, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'provinceId' })
  province?: MProvince;
}
