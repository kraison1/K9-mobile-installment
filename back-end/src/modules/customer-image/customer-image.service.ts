import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerImage } from './entities/customer-image.entity';
import { Customer } from '../customer/entities/customer.entity';
import { UpdateCustomerImageDto } from './dto/update-customer-image.dto';

import * as path from 'path';
import { unlink, access } from 'fs/promises';

@Injectable()
export class CustomerImageService {
  constructor(
    @InjectRepository(CustomerImage)
    private readonly customerImageRepository: Repository<CustomerImage>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async updateSeq(
    updateCustomerImageDto: UpdateCustomerImageDto[],
  ): Promise<void> {
    const customerId = updateCustomerImageDto[0]?.customerId;
    await this.customerImageRepository.manager.transaction(
      async (entityManager) => {
        for (const imageUpdate of updateCustomerImageDto) {
          await entityManager.update(
            CustomerImage,
            { id: imageUpdate.id },
            { seq: imageUpdate.seq },
          );
        }
      },
    );

    const customerImage = await this.customerImageRepository
      .createQueryBuilder('customerImage')
      .where('customerImage.customerId = :customerId', { customerId })
      .orderBy('customerImage.seq', 'ASC')
      .getOne();
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (customer) {
      await this.customerRepository.update(customer.id, {
        ...customer,
        fileCustomer: customerImage.name,
      });
    }
  }

  async delete(id: number): Promise<any> {
    const findImage = await this.customerImageRepository.findOne({
      where: { id },
    });

    const filePath = path.join(findImage.name);
    await access(filePath).then(() => unlink(filePath));
    await this.customerImageRepository.delete({ id });
  }
}
