import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseTypeSearchDto } from 'src/helper/search.dto';
import { ExpenseType } from './entities/expense-type.entity';
import { CreateExpenseTypeDto } from './dto/create-expense-type.dto';
import { UpdateExpenseTypeDto } from './dto/update-expense-type.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ExpenseTypeService {
  constructor(
    @InjectRepository(ExpenseType)
    private readonly expenseTypeRepository: Repository<ExpenseType>,
  ) {}

  async create(createExpenseTypeDto: CreateExpenseTypeDto): Promise<any> {
    const newExpenseType =
      this.expenseTypeRepository.create(createExpenseTypeDto);
    this.expenseTypeRepository.save(newExpenseType);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newExpenseType.code}`,
    };
  }

  async findAll(search: ExpenseTypeSearchDto): Promise<{
    data: ExpenseType[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.expenseTypeRepository.createQueryBuilder('expense_type');

    queryBuilder.select([
      'expense_type.*',
      `CASE WHEN expense_type.type = '1' THEN 'คิดต้นทุน' ELSE 'ไม่คิด' END as type_str`,
    ]);

    if (search.search) {
      queryBuilder.andWhere(
        '(expense_type.code ILIKE :search OR expense_type.name ILIKE :search)',
        { search: `%${search.search}%` },
      );
    }

    if (search.active !== '2') {
      queryBuilder.andWhere('expense_type.active = :active', {
        active: search.active,
      });
    }

    if (search.type !== '2') {
      queryBuilder.andWhere('expense_type.type = :type', {
        type: search.type,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('expense_type.code', 'ASC')
      .skip((search.page - 1) * search.pageSize)
      .take(search.pageSize);

    const expenseTypes = await queryBuilder.getRawMany();

    return {
      data: expenseTypes,
      total,
      page: search.page,
      pageSize: search.pageSize,
    };
  }

  async getSelect(): Promise<
    Pick<ExpenseType, 'id' | 'name' | 'type' | 'code'>[]
  > {
    return this.expenseTypeRepository.find({
      where: { active: '1' },
      select: ['id', 'name', 'type', 'code'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ExpenseType | null> {
    return this.expenseTypeRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateExpenseTypeDto: UpdateExpenseTypeDto,
  ): Promise<any> {
    await this.expenseTypeRepository.update(id, updateExpenseTypeDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateExpenseTypeDto.code}`,
    };
  }
}
