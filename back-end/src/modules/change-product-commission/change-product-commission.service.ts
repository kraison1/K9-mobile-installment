import { Product } from 'src/modules/product/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChangeProductCommissionDto } from './dto/create-change-product-commission.dto';
import { ChangeProductCommission } from './entities/change-product-commission.entity';
import { ChangeProductCommissionSearchDto } from 'src/helper/search.dto'; // Assuming you are using a similar search DTO
import dayjs from 'src/configs/dayjs-config';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import { MESSAGE_SAVE_SUCCESS } from 'src/helper/constanc';

@Injectable()
export class ChangeProductCommissionService {
  constructor(
    @InjectRepository(ChangeProductCommission)
    private readonly changeProductCommissionRepository: Repository<ChangeProductCommission>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productLogService: ProductLogService,
  ) {}

  async create(
    createChangeProductCommissionDto: CreateChangeProductCommissionDto,
  ): Promise<any> {
    const prefix = 'Com';
    const today = dayjs().format('YYYYMMDD');

    const runNumber = (
      (await this.changeProductCommissionRepository
        .createQueryBuilder('change_product_commission')
        .where('DATE(change_product_commission.create_date) = :today', {
          today: dayjs().format('YYYY-MM-DD'),
        })
        .getCount()) + 1
    )
      .toString()
      .padStart(4, '0'); // คำนวณ run number และเติม 4 หลัก

    // อัปเดต product ด้วยข้อมูลใหม่
    const updateProducts = await this.productRepository.find({
      where: {
        productModelId: createChangeProductCommissionDto.productModelId,
        productStorageId: createChangeProductCommissionDto.productStorageId,
        hand: createChangeProductCommissionDto.hand,
        catalog: 'มือถือ',
        active: '1',
      },
    });

    // สร้าง ChangeProductCommission และบันทึกข้อมูล
    const newChangeProductCommission =
      this.changeProductCommissionRepository.create({
        ...createChangeProductCommissionDto,
        code: `${prefix}${today}${runNumber}`, // สร้าง code ในบรรทัดเดียว
      });

    for (let index = 0; index < updateProducts.length; index++) {
      const existingProduct = await this.productRepository.findOne({
        where: { id: updateProducts[index].id },
      });

      const updateProductDto = {
        ...existingProduct,
        priceCommission: newChangeProductCommission.priceCommission,
        updateByUserId: newChangeProductCommission.createByUserId,
        note: `รหัสปรับค่าคอมใหม่: ${newChangeProductCommission.code}`,
      };

      // บันทึกการเปลี่ยนแปลงลง ProductLog ก่อนอัปเดต
      const productLogDto: CreateProductLogDto = {
        productId: updateProducts[index].id,
        action: 'อัพเดตค่าคอม',
        obj: JSON.stringify({
          before: existingProduct,
          after: updateProductDto,
        }),
        branchId: createChangeProductCommissionDto.branchId,
        userId: createChangeProductCommissionDto.createByUserId,
      };

      await this.productLogService.create(productLogDto);

      // อัปเดต Product
      await this.productRepository.update(
        updateProducts[index].id,
        updateProductDto,
      );
    }

    await this.changeProductCommissionRepository.save(
      newChangeProductCommission,
    );

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchDto: ChangeProductCommissionSearchDto): Promise<{
    data: ChangeProductCommission[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.changeProductCommissionRepository.createQueryBuilder(
        'change_product_commission',
      );

    queryBuilder
      .select(['change_product_commission', 'user.id', 'user.name'])
      .leftJoinAndSelect(
        'change_product_commission.productModel',
        'product_model',
      )
      .leftJoin('change_product_commission.create_by', 'user');

    if (searchDto.search) {
      queryBuilder.where('change_product_commission.code ILIKE :search', {
        search: `%${searchDto.search}%`,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('change_product_commission.create_date', 'DESC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const changeProductCommissions = await queryBuilder.getMany();

    return {
      data: changeProductCommissions,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ChangeProductCommission | null> {
    return this.changeProductCommissionRepository.findOne({ where: { id } });
  }
}
