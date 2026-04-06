import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManageAppleIdSearchDto } from 'src/helper/search.dto';
import { ManageAppleId } from './entities/manage-apple-id.entity';
import { CreateManageAppleIdDto } from './dto/create-manage-apple-id.dto';
import { UpdateManageAppleIdDto } from './dto/update-manage-apple-id.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ManageAppleIdService {
  constructor(
    @InjectRepository(ManageAppleId)
    private readonly expenseTypeRepository: Repository<ManageAppleId>,
  ) {}

  async create(
    createManageAppleIdDto: CreateManageAppleIdDto,
    req: FastifyRequest,
  ): Promise<any> {
    const user = (req as any).user;
    createManageAppleIdDto.createByUserId = user.id;
    createManageAppleIdDto.branchId =
      createManageAppleIdDto.branchId || user.branchId;

    const newManageAppleId = this.expenseTypeRepository.create(
      createManageAppleIdDto,
    );
    this.expenseTypeRepository.save(newManageAppleId);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newManageAppleId.appId}`,
    };
  }

  async findAll(searchManageAppleIdDto: ManageAppleIdSearchDto): Promise<{
    data: ManageAppleId[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.expenseTypeRepository.createQueryBuilder('manage_apple_id');

    queryBuilder.select(['manage_apple_id.*']);

    if (searchManageAppleIdDto.branchId !== 0) {
      queryBuilder.andWhere('manage_apple_id.branchId = :branchId', {
        branchId: searchManageAppleIdDto.branchId,
      });
    }

    if (searchManageAppleIdDto.search) {
      queryBuilder.andWhere(
        '(manage_apple_id."appId" ILIKE :search OR manage_apple_id.pass ILIKE :search OR manage_apple_id.note ILIKE :search)',
        { search: `%${searchManageAppleIdDto.search}%` },
      );
    }

    if (searchManageAppleIdDto.active !== '2') {
      queryBuilder.andWhere('manage_apple_id.active = :active', {
        active: searchManageAppleIdDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('manage_apple_id."appId"', 'ASC')
      .skip((searchManageAppleIdDto.page - 1) * searchManageAppleIdDto.pageSize)
      .take(searchManageAppleIdDto.pageSize);

    const expenseTypes = await queryBuilder.getRawMany();

    return {
      data: expenseTypes,
      total,
      page: searchManageAppleIdDto.page,
      pageSize: searchManageAppleIdDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ManageAppleId | null> {
    return this.expenseTypeRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateManageAppleIdDto: UpdateManageAppleIdDto,
  ): Promise<any> {
    await this.expenseTypeRepository.update(id, updateManageAppleIdDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateManageAppleIdDto.appId}`,
    };
  }
}
