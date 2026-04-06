import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ProductPayMentList } from './entities/product-pay-ment-list.entity';
import { ProductSalePayMentListSearchDto } from 'src/helper/search.dto';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import dayjs from 'dayjs';
import { Branch } from '../branchs/entities/branch.entity';
import { RedisService } from 'src/redis/redis.service';
import { Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MESSAGE_UPDATE_SUCCESS } from 'src/helper/constanc';
import { formatNumberDigit } from 'src/helper/formatNumber';
// Type สำหรับข้อมูลจาก Redis
type RedisPayment = {
  id: number;
  datePay: Date;
  priceDebt: number;
  valueFollowOneMonth: number;
  valueFollowMoreThanMonth: number;
};

@Injectable()
export class ProductPayMentListsService {
  constructor(
    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,
    private readonly dataSource: DataSource,
  ) {}
  private readonly UPDATE_CHUNK_SIZE = 2000;
  private readonly BATCH_SIZE = 20000;

  async findAll(searchProductDto: ProductSalePayMentListSearchDto): Promise<
    | {
        data: ProductPayMentList[];
        total: number;
        page: number;
        pageSize: number;
      }
    | any
  > {
    const productSale = await this.productSaleRepository.findOne({
      select: ['id'],
      where: { code: searchProductDto.search, isCancel: '0' },
    });

    if (productSale) {
      const queryBuilder = this.productPayMentListRepository.createQueryBuilder(
        'product_pay_ment_lists',
      );

      if (productSale) {
        queryBuilder.where('product_pay_ment_lists.productSaleId = :id', {
          id: productSale.id,
        });
      }

      const total = await queryBuilder.getCount();

      queryBuilder
        .orderBy('product_pay_ment_lists.payNo', 'ASC')
        .skip((searchProductDto.page - 1) * searchProductDto.pageSize)
        .take(searchProductDto.pageSize);

      const productPayments = await queryBuilder.getMany();

      return {
        data: productPayments,
        total,
        page: searchProductDto.page,
        pageSize: searchProductDto.pageSize,
      };
    }
  }

  private async processBatch(
    payments: ProductPayMentList[] | RedisPayment[],
    totalRecords: number,
    updateChunkSize: number,
  ): Promise<{ hasMore: boolean; totalRecords: number }> {
    const batchCount = payments.length;
    if (batchCount === 0) return { hasMore: false, totalRecords };

    totalRecords += batchCount;

    const updates = payments.map((payment: any) => {
      const branchData = payment.productSale?.branch || {};
      if (!branchData) {
        console.log(
          `Error: payment.productSale.branch is undefined for payment ID: ${payment.id}`,
          payment,
        );
      }

      const daysDiff = dayjs().diff(dayjs(payment.datePay), 'day');
      let additionalDebt = 0;

      if (daysDiff == 2) {
        additionalDebt = (branchData.valueFollowOneMonth || 0) * 2;
      } else if (daysDiff >= 3) {
        const monthsDiff = dayjs().diff(dayjs(payment.datePay), 'month', true);
        additionalDebt =
          monthsDiff <= 1
            ? branchData.valueFollowOneMonth || 0
            : branchData.valueFollowMoreThanMonth || 0;
      }

      const newPriceDebt =
        Number(payment.priceDebt || 0) + Number(additionalDebt || 0);

      return { id: payment.id, priceDebt: newPriceDebt };
    });

    for (let i = 0; i < updates.length; i += updateChunkSize) {
      const chunk = updates.slice(i, i + updateChunkSize);
      const validChunk = chunk.filter(
        (u) => u.id != null && !isNaN(u.priceDebt) && u.priceDebt != null,
      );

      if (validChunk.length === 0) {
        console.log('No valid records in chunk, skipping');
        continue;
      }

      const values = validChunk
        .map((u) => `(${u.id}, ${Number(u.priceDebt)})`)
        .join(', ');
      await this.productPayMentListRepository.query(`
        UPDATE product_pay_ment_list
        SET "priceDebt" = updates.price_debt
        FROM (VALUES ${values}) AS updates(id, price_debt)
        WHERE product_pay_ment_list.id = updates.id
      `);
    }

    return { hasMore: true, totalRecords };
  }

  async overdue(): Promise<any> {
    let totalRecords = 0;
    let skip = 0;

    console.time('Total Overdue Process');
    console.log('Starting: Total Overdue Process');

    while (true) {
      const payments = await this.productPayMentListRepository
        .createQueryBuilder('payment')
        .select(['payment.id', 'payment.datePay', 'payment.priceDebt'])
        .leftJoin('payment.productSale', 'productSale')
        .addSelect('productSale.id')
        .leftJoin('productSale.branch', 'branch')
        .addSelect([
          'branch.valueFollowOneMonth',
          'branch.valueFollowMoreThanMonth',
        ])
        .where('payment.isPaySuccess = :payStatus', { payStatus: '3' })
        .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
        .take(this.BATCH_SIZE)
        .skip(skip)
        .getMany();

      const { hasMore, totalRecords: updatedTotal } = await this.processBatch(
        payments,
        totalRecords,
        this.UPDATE_CHUNK_SIZE,
      );
      totalRecords = updatedTotal;
      if (!hasMore) break;

      skip += this.BATCH_SIZE;
    }

    console.timeEnd('Total Overdue Process');
    console.log(`Total records processed: ${totalRecords}`);
  }

  async checkPayMent(): Promise<void> {
    const currentDate = dayjs().toDate();
    const beforeDate = dayjs().subtract(2, 'day').toDate();

    console.time('Check Payment Status');

    const queryRunner =
      this.productPayMentListRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // อัพเดต record ที่มีหนี้ค้าง (เมื่อวาน)
      console.log('Start OverduePayments');
      await this.processPayments(
        queryRunner,
        beforeDate,
        '2', // payStatus condition
        '3', // target payStatus
        'OverduePayments',
      );

      // อัพเดต record ที่ครบกำหนดวันนี้
      console.log('Start duePayments');
      await this.processPayments(
        queryRunner,
        currentDate,
        '4', // payStatus condition
        '2', // target payStatus
        'duePayments',
      );

      await queryRunner.commitTransaction();
      await this.overdue();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in checkPayMent:', error);
      throw error;
    } finally {
      await queryRunner.release();
      console.timeEnd('Check Payment Status');
    }
  }

  private async processPayments(
    queryRunner: QueryRunner,
    datePay: Date,
    sourcePayStatus: string,
    targetPayStatus: string,
    logLabel: string,
  ): Promise<void> {
    let skip = 0;

    while (true) {
      const payments = await queryRunner.manager
        .createQueryBuilder()
        .select(['payment.id', 'payment.productSaleId'])
        .from('product_pay_ment_list', 'payment')
        .where('payment.datePay BETWEEN :startDate AND :endDate', {
          startDate: dayjs(datePay)
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss'),
          endDate: dayjs(datePay).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        })
        .andWhere('payment.isPaySuccess = :payStatus', {
          payStatus: sourcePayStatus,
        })
        .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
        .take(this.BATCH_SIZE)
        .skip(skip)
        .getRawMany();

      const batchCount = payments.length;
      if (batchCount === 0) break;

      const paymentIds = payments.map((p) => p.payment_id);
      const productIds = payments.map((p) => p.payment_productSaleId);

      console.log(`${logLabel} batch:`, batchCount);

      await Promise.all([
        queryRunner.manager
          .createQueryBuilder()
          .update('product_pay_ment_list')
          .set({ isPaySuccess: targetPayStatus })
          .where('id IN (:...ids)', { ids: paymentIds })
          .execute(),

        queryRunner.manager
          .createQueryBuilder()
          .update('product_sale')
          .set({ isPaySuccess: targetPayStatus })
          .where('id IN (:...ids)', { ids: productIds })
          .execute(),
      ]);

      skip += this.BATCH_SIZE;
    }
  }

  async checkPayMentFollow(): Promise<{
    updatedSaleIds: number[];
    affectedSales: number;
    affectedPayments: number;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      // 1) หา productSaleId ที่เข้าเงื่อนไข (>=2)
      const targets = await manager
        .createQueryBuilder()
        .select('ppl.productSaleId', 'productSaleId')
        .from(ProductPayMentList, 'ppl')
        .where('ppl.isPaySuccess IN (:...isPaySuccess)', {
          isPaySuccess: ['3'],
        })
        .andWhere('ppl.isCaseSuccess = :isCaseSuccess', { isCaseSuccess: '1' })
        .groupBy('ppl.productSaleId')
        .having('COUNT(ppl.id) >= :minCount', { minCount: 2 })
        .getRawMany<{ productSaleId: string | number }>();

      const saleIds = targets
        .map((t) => Number(t.productSaleId))
        .filter(Boolean);

      if (saleIds.length === 0) {
        return { updatedSaleIds: [], affectedSales: 0, affectedPayments: 0 };
      }

      // console.log('saleIds', saleIds);

      // 2) update product_sale.isPaySuccess = 8
      const saleUpdate = await manager
        .createQueryBuilder()
        .update(ProductSale)
        .set({ isPaySuccess: '8' })
        .where('id IN (:...saleIds)', { saleIds })
        .execute();

      // 3) update product_pay_ment_list.isPaySuccess = 8
      const payUpdate = await manager
        .createQueryBuilder()
        .update(ProductPayMentList)
        .set({ isPaySuccess: '8' })
        .where('productSaleId IN (:...saleIds)', { saleIds })
        .andWhere('isPaySuccess = :oldStatus', { oldStatus: '3' })
        .andWhere('isCaseSuccess = :isCaseSuccess', { isCaseSuccess: '1' })
        .execute();

      // optional log
      // console.log('[updatePayMentFollow] saleIds:', saleIds.length);
      // console.log(
      //   '[updatePayMentFollow] affectedSales:',
      //   saleUpdate.affected ?? 0,
      // );
      // console.log(
      //   '[updatePayMentFollow] affectedPayments:',
      //   payUpdate.affected ?? 0,
      // );

      // return {
      //   updatedSaleIds: saleIds,
      //   affectedSales: saleUpdate.affected ?? 0,
      //   affectedPayments: payUpdate.affected ?? 0,
      // };
    });
  }

  async findOne(id: number): Promise<any> {
    return this.productPayMentListRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const { payNo, priceDebt, datePay, note } = req.body as any;

    const values = {
      priceDebt: priceDebt?.value ?? 0,
      datePay: datePay?.value ?? new Date(),
      note: note?.value ?? '',
    };

    await this.productPayMentListRepository.update(id, values);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS} งวดที่: ${formatNumberDigit(payNo.value)}`,
    };
  }
}
