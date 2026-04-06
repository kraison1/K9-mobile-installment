import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { unlink, access } from 'fs/promises';
import { ExpenseImage } from './entities/expense-image.entity';
import { UpdateExpenseImageDto } from './dto/update-expense-image.dto';

@Injectable()
export class ExpenseImagesService {
  constructor(
    @InjectRepository(ExpenseImage)
    private readonly expenseImageRepository: Repository<ExpenseImage>,
  ) {}

  async updateSeq(
    updateExpenseImageDto: UpdateExpenseImageDto[],
  ): Promise<void> {
    await this.expenseImageRepository.manager.transaction(
      async (entityManager) => {
        for (const imageUpdate of updateExpenseImageDto) {
          await entityManager.update(
            ExpenseImage,
            { id: imageUpdate.id },
            { seq: imageUpdate.seq },
          );
        }
      },
    );
  }

  async delete(id: number): Promise<any> {
    const findImage = await this.expenseImageRepository.findOne({
      where: { id },
    });

    const filePath = path.join(findImage.name);
    await access(filePath).then(() => unlink(filePath));
    await this.expenseImageRepository.delete({ id });
  }
}
