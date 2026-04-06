import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { MDistrict } from 'src/modules/m-district/entities/m-district.entity';
import { MProvince } from 'src/modules/m-province/entities/m-province.entity';
import { MSubdistrict } from 'src/modules/m-subdistrict/entities/m-subdistrict.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CustomerImage } from 'src/modules/customer-image/entities/customer-image.entity';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  citizenIdCard: string;

  @ApiProperty({ default: '' })
  @Column()
  code: string;

  @ApiProperty({ default: '' })
  @Column()
  name: string;

  @ApiProperty({ default: '' })
  @Column()
  lastname: string;

  @ApiProperty({ default: '' })
  @Column()
  tel: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  facebook: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  nameRefOne: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  lastnameRefOne: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  telRefOne: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  relaRefOne: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  nameRefTwo: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  lastnameRefTwo: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  telRefTwo: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  relaRefTwo: string;

  @ApiProperty({ default: null })
  @Column({ nullable: true })
  googleMap: string;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  address: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true, default: '' })
  idCardAddress: string;

  @ApiProperty({ default: '' })
  @Column()
  branchId: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  updateByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'updateByUserId' })
  updateBy?: User;

  @ManyToOne(() => Branch, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  mProvinceId: number;

  @ApiProperty({ default: '' })
  @Column({ nullable: true, default: null })
  idCardProvinceId: number;

  @ManyToOne(() => MProvince, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'mProvinceId' })
  mProvince?: MProvince;

  @ManyToOne(() => MProvince, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'idCardProvinceId' })
  idCardProvince?: MProvince;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  mDistrictId: number;

  @ApiProperty({ default: '' })
  @Column({ nullable: true, default: null })
  idCardDistrictId: number;

  @ManyToOne(() => MDistrict, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'mDistrictId' })
  mDistrict?: MDistrict;

  @ManyToOne(() => MDistrict, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'idCardDistrictId' })
  idCardDistrict?: MDistrict;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  mSubdistrictId: number;

  @ApiProperty({ default: '' })
  @Column({ nullable: true, default: null })
  idCardSubdistrictId: number;

  @ManyToOne(() => MSubdistrict, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mSubdistrictId' })
  mSubdistrict: MSubdistrict;

  @ManyToOne(() => MSubdistrict, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'idCardSubdistrictId' })
  idCardSubdistrict: MSubdistrict;

  @ApiProperty({ default: '1' })
  @Column()
  zipCode: string;

  @ApiProperty({ default: '1' })
  @Column({ nullable: true, default: '' })
  idCardZipCode: string;

  @ApiProperty({ default: '1' })
  @Column()
  active: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  customerType: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileCustomer?: string;

  @OneToMany(() => CustomerImage, (customerImage) => customerImage.customer)
  customerImages?: CustomerImage[];

  @OneToMany(() => ProductSale, (productSale) => productSale.customer)
  productSale?: ProductSale[];

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
