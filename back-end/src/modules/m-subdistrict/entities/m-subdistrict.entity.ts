import { ApiProperty } from '@nestjs/swagger';
import { MDistrict } from 'src/modules/m-district/entities/m-district.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
@Entity()
export class MSubdistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ default: '' })
  @Column({ type: 'text' })
  postcode: string;

  @ApiProperty({ default: '' })
  @Column()
  districtId: number;

  @ManyToOne(() => MDistrict, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'districtId' })
  district?: MDistrict;
}
