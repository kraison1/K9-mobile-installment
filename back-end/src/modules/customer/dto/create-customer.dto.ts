import { PickType } from '@nestjs/swagger';
import { Customer } from '../entities/customer.entity';

export class CreateCustomerDto extends PickType(Customer, [
  'citizenIdCard',
  'name',
  'lastname',
  'tel',
  'facebook',
  'googleMap',

  'nameRefOne',
  'lastnameRefOne',
  'relaRefOne',
  'telRefOne',

  'nameRefTwo',
  'lastnameRefTwo',
  'relaRefTwo',
  'telRefTwo',

  'address',
  'mProvinceId',
  'mDistrictId',
  'mSubdistrictId',
  'zipCode',

  'idCardAddress',
  'idCardProvinceId',
  'idCardDistrictId',
  'idCardSubdistrictId',
  'idCardZipCode',

  'branchId',
  'active',
  'fileCustomer',
] as const) {}
