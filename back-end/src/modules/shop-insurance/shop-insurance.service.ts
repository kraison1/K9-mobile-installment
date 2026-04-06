import { Injectable } from '@nestjs/common';
import { CreateShopInsuranceDto } from './dto/create-shop-insurance.dto';
import { UpdateShopInsuranceDto } from './dto/update-shop-insurance.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopInsurance } from './entities/shop-insurance.entity';
import { ShopInsuranceSearchDto } from 'src/helper/search.dto';

@Injectable()
export class ShopInsuranceService {
  constructor(
    @InjectRepository(ShopInsurance)
    private readonly shopInsuranceRepository: Repository<ShopInsurance>,
  ) {}

  async create(createShopInsuranceDto: CreateShopInsuranceDto): Promise<any> {
    const newShopInsurance = this.shopInsuranceRepository.create(
      createShopInsuranceDto,
    );
    this.shopInsuranceRepository.save(newShopInsurance);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newShopInsurance.name}`,
    };
  }

  async findAll(search: ShopInsuranceSearchDto): Promise<{
    data: ShopInsurance[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.shopInsuranceRepository.createQueryBuilder('shop_insurance');

    queryBuilder.select([
      'shop_insurance.*',
    ]);

    if (search.search) {
      queryBuilder.andWhere(
        '(shop_insurance.name ILIKE :search)',
        { search: `%${search.search}%` },
      );
    }

    if (search.active !== '2') {
      queryBuilder.andWhere('shop_insurance.active = :active', {
        active: search.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('CAST(shop_insurance.name AS INTEGER)', 'ASC')
      .skip((search.page - 1) * search.pageSize)
      .take(search.pageSize);
//       [
//     {
//         "id": 1,
//         "name": "0",
//         "active": "1"
//     },
//     {
//         "id": 3,
//         "name": "15",
//         "active": "1"
//     },
//     {
//         "id": 4,
//         "name": "30",
//         "active": "1"
//     },
//     {
//         "id": 2,
//         "name": "7",
//         "active": "1"
//     }
// ]

    const shopInsurances = await queryBuilder.getRawMany();

    return {
      data: shopInsurances,
      total,
      page: search.page,
      pageSize: search.pageSize,
    };
  }

  async getSelect(): Promise<Pick<ShopInsurance, 'id' | 'name'>[]> {
    return this.shopInsuranceRepository
      .createQueryBuilder('shop_insurance')
      .select(['shop_insurance.id AS id', 'shop_insurance.name AS name'])
      .where('shop_insurance.active = :active', { active: '1' })
      .orderBy('CAST(shop_insurance.name AS INTEGER)', 'ASC')
      .getRawMany();
  }

  async findOne(id: number): Promise<ShopInsurance | null> {
    return this.shopInsuranceRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateShopInsuranceDto: UpdateShopInsuranceDto,
  ): Promise<any> {
    await this.shopInsuranceRepository.update(id, updateShopInsuranceDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateShopInsuranceDto.name}`,
    };
  }
}
