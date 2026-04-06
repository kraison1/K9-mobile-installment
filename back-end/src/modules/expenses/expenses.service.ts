import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseType } from 'src/modules/expense-types/entities/expense-type.entity';
import { ExpenseSearchDto } from 'src/helper/search.dto';
import { Branch } from '../branchs/entities/branch.entity';
import dayjs from 'src/configs/dayjs-config';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { FastifyRequest } from 'fastify';
import PdfPrinter from 'pdfmake/src/printer';
import sharp from 'sharp';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateRandomString } from 'src/helper/generateRandomString';
import { isEmpty } from 'lodash';

import {
  formatDateNumberWithoutTime,
  formatDateTH,
} from 'src/helper/formatDate';
import { formatNumberDigit } from 'src/helper/formatNumber';
import { ExpenseImage } from '../expense-images/entities/expense-image.entity';

@Injectable()
export class ExpensesService {
  private readonly uploadsPath = path.join('uploads/expenses');

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseImage)
    private readonly expenseImageRepository: Repository<ExpenseImage>,
    @InjectRepository(ExpenseType)
    private readonly expenseTypeRepository: Repository<ExpenseType>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      code,
      price,
      type,
      expenseTypeId,
      note,
      bankId,
      create_date,
      payType,
    } = req.body as any;

    const values = {
      price: price?.value ?? null,
      type: type?.value ?? null,
      note: note?.value ?? null,
      expenseTypeId: expenseTypeId?.value ?? null,
      code: code?.value ?? null,
      branchId: user.branchId,
      bankId: bankId?.value ?? null,
      create_date: create_date?.value ?? null,
      payType: payType?.value ?? null,
      createByUserId: user.id,
    };

    const expenseType = await this.expenseTypeRepository.findOneOrFail({
      where: { id: values.expenseTypeId },
    });

    const branch = await this.branchRepository.findOneOrFail({
      where: { id: values.branchId },
    });

    const dateCode = dayjs().format('YYYYMMDD');
    const lastExpense = await this.expenseRepository.findOne({
      where: {
        code: Between(
          `${expenseType.code}${branch.code}${dateCode}0001`,
          `${expenseType.code}${branch.code}${dateCode}9999`,
        ),
      },
      order: { code: 'DESC' },
    });

    const runNumber = lastExpense
      ? (parseInt(lastExpense.code.slice(-4)) + 1).toString().padStart(4, '0')
      : '0001';

    values.code = `${expenseType.code}${branch.code}${dateCode}${runNumber}`;
    const createExpense = this.expenseRepository.create(values);
    const newExpense = await this.expenseRepository.save(createExpense);

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${newExpense.code}`);

      const imagePromises = files.map(async (file, index) => {
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index + 1}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${newExpense.code}`,
          filename,
        );

        // Stream file processing with Sharp to reduce memory usage
        const readStream = fs.createReadStream(file.filepath);
        const writeStream = fs.createWriteStream(filePath);
        const sharpStream = sharp()
          .png({ quality: 80, progressive: true }) // Progressive PNG for faster rendering
          .on('error', (err) => {
            throw err;
          });

        await new Promise<void>((resolve, reject) => {
          readStream
            .pipe(sharpStream)
            .pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
        });

        return this.expenseImageRepository.create({
          name: filePath,
          expenseId: newExpense.id,
          userId: values.createByUserId,
          seq: index + 1,
        });
      });

      const newImages = await Promise.all(imagePromises); // Parallelize image processing
      await this.expenseImageRepository.save(newImages); // Batch save images
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newExpense.code}`,
    };
  }

  async findAll(searchExpenseDto: ExpenseSearchDto): Promise<{
    data: Expense[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.expenseRepository.createQueryBuilder('expense');

    queryBuilder
      .select([
        'expense',
        'user.id',
        'user.name',
        'expenseType.name',
        'bank.bankOwner',
        'bank.bankName',
        'bank.bankNo',
      ])
      .leftJoin('expense.create_by', 'user')
      .leftJoin('expense.expenseType', 'expenseType')
      .leftJoin('expense.bank', 'bank');

    if (searchExpenseDto.branchId) {
      queryBuilder.where('expense.branchId = :branchId', {
        branchId: searchExpenseDto.branchId,
      });
    }

    if (searchExpenseDto.search) {
      queryBuilder.andWhere(
        '(expense.code ILIKE :search OR bank.bankNo ILIKE :search OR bank.bankOwner ILIKE :search OR expenseType.name ILIKE :search)',
        {
          search: `%${searchExpenseDto.search}%`,
        },
      );
    }

    if (searchExpenseDto.active !== '2') {
      queryBuilder.andWhere('expense.active = :active', {
        active: searchExpenseDto.active,
      });
    }

    queryBuilder.andWhere(
      'expense.create_date BETWEEN :startDate AND :endDate',
      {
        startDate: new Date(searchExpenseDto.startDate),
        endDate: new Date(searchExpenseDto.endDate),
      },
    );

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('expense.create_date', 'DESC')
      .skip((searchExpenseDto.page - 1) * searchExpenseDto.pageSize)
      .take(searchExpenseDto.pageSize);

    const expenses = await queryBuilder.getMany();

    return {
      data: expenses,
      total,
      page: searchExpenseDto.page,
      pageSize: searchExpenseDto.pageSize,
    };
  }

  async findOne(id: number): Promise<Expense | null> {
    // const expenses = await this.expenseRepository.find();

    // for (let index = 0; index < expenses.length; index++) {
    //   const newImages = this.expenseImageRepository.create({
    //     name: expenses[index].fileExpense || '',
    //     expenseId: expenses[index].id,
    //     userId: expenses[index].createByUserId,
    //     seq: 1,
    //   });
    //   await this.expenseImageRepository.save(newImages);
    // }

    return this.expenseRepository.findOne({
      where: { id },
      relations: ['expenseImages'],
      order: {
        expenseImages: {
          seq: 'ASC',
        },
      },
    });
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const expense = await this.expenseRepository.findOne({ where: { id } });

    if (user.branchId !== expense.branchId) {
      return {
        message_success: `คุณไม่มีสิทธิลบในสาขานี้`,
      };
    }

    if (isEmpty(expense)) {
      return {
        message_success: `ค้นหาค่าใช้จ่ายไม่เจอ`,
      };
    }

    try {
      const expenseImages = await this.expenseImageRepository.find({
        where: { expenseId: id },
      });

      for (let index = 0; index < expenseImages.length; index++) {
        // ตรวจสอบว่าไฟล์มีอยู่จริง
        const fileExists = await fs.pathExists(expenseImages[index].name);
        if (fileExists) {
          await fs.remove(expenseImages[index].name);
        }
      }

      const expenseCode = expense.code;
      const folderPath = path.join(this.uploadsPath, expenseCode);
      const folderExists = await fs.pathExists(folderPath);
      if (folderExists) {
        // ตรวจสอบว่าโฟลเดอร์ว่างหรือไม่
        const files = await fs.readdir(folderPath);
        if (files.length === 0) {
          await fs.remove(folderPath); // ลบโฟลเดอร์ถ้าว่าง
        }
      }
    } catch (error) {}

    await this.expenseRepository.delete(id);

    return {
      message_success: `${MESSAGE_DELETE_SUCCESS}`,
    };
  }

  async printExpensesPdf(req: FastifyRequest): Promise<Buffer> {
    const user = (req as any).user;

    const { branchId, startDate, endDate } = req.body as any;
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    // Function to create base query
    const createBaseQuery = () =>
      this.expenseRepository
        .createQueryBuilder('expense')
        .leftJoin('expense.create_by', 'user')
        .leftJoin('expense.expenseType', 'expenseType')
        .where('expense.branchId = :branchId', { branchId })
        .andWhere('expense.create_date BETWEEN :start AND :end', {
          start,
          end,
        });

    // Query 1: Fetch expenses
    const query1 = createBaseQuery()
      .select([
        'expense.code',
        'expense.price',
        'expense.note',
        'expense.create_date',
        'user.id',
        'user.name',
        'expenseType.name',
      ])
      .orderBy('create_date', 'ASC')
      .getMany();

    // Query 2: Fetch total price
    const query2 = createBaseQuery()
      .select('SUM(expense.price)', 'totalPrice')
      .getRawOne()
      .then((result) => Number(result.totalPrice) || 0);

    // Execute queries
    const [expenses, totalPrice] = await Promise.all([query1, query2]);

    const branch = await this.branchRepository.findOneBy({ id: branchId });
    if (!branch) {
      throw new Error('Branch not found');
    }

    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'รหัส', style: 'tableHeader' },
      { text: 'ประเภท', style: 'tableHeader' },
      { text: 'โดย', style: 'tableHeader' },
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'ยอด', style: 'tableHeader' },
    ];

    const tableBody = [
      tableHeader,
      ...expenses.map((item: Expense, k: number) => [
        { text: k + 1, alignment: 'right' },
        { text: item.code || '-', alignment: 'left' },
        {
          text: `${item.expenseType?.name || '-'} / ${item?.note || '-'}`,
          alignment: 'left',
        },
        { text: item.create_by?.name || '-', alignment: 'left' },
        { text: formatDateTH(item.create_date) || '-', alignment: 'right' },
        {
          text: item.price ? formatNumberDigit(Number(item.price)) : '0',
          alignment: 'right',
        },
      ]),
    ];

    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../../node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 10],
      info: {
        title: `ค่าใช้จ่าย`,
        author: user.name,
        subject: `สร้างเมื่อ-${formatDateTH(dayjs())}`,
        creator: user.name,
        producer: process.env.SERVICE_NAME || 'Expense Service',
      },
      content: [
        {
          stack: [
            { text: `ตารางค่าใช้จ่าย`, style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่: ${formatDateNumberWithoutTime(startDate)} ถึง ${formatDateNumberWithoutTime(endDate)}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนรายการ: ${expenses.length}`,
                      style: 'subheaderLeft',
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: `สาขา: ${branch.name}`,
                      style: 'subheaderRight',
                    },
                    {
                      text: `ยอดรวม: ${formatNumberDigit(totalPrice)}`,
                      style: 'subheaderRight',
                    },
                  ],
                },
              ],
            },
          ],
        },
        { text: '', margin: [0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
          },
        },
        ...(expenses.length === 0
          ? [
              {
                text: 'ไม่มีข้อมูลสำหรับแสดง',
                style: 'subheaderLeft',
                margin: [0, 10],
              },
            ]
          : []),
      ],
      styles: {
        header: { fontSize: 14, alignment: 'center', margin: [0, 0, 0, 10] },
        subheaderLeft: {
          fontSize: 10,
          alignment: 'left',
          margin: [0, 2, 0, 2],
        },
        subheaderRight: {
          fontSize: 10,
          alignment: 'right',
          margin: [0, 2, 0, 2],
        },
        tableHeader: { fontSize: 10, alignment: 'center' },
      },
      defaultStyle: {
        font: 'Sarabun',
        lineHeight: 1.2,
        fontSize: 10,
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.end();

    return new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      code,
      price,
      type,
      expenseTypeId,
      note,
      bankId,
      create_date,
      payType,
    } = req.body as any;

    const values = {
      price: price?.value ?? null,
      type: type?.value ?? null,
      note: note?.value ?? null,
      expenseTypeId: expenseTypeId?.value ?? null,
      code: code?.value ?? null,
      branchId: user.branchId,
      bankId: bankId?.value ?? null,
      create_date: create_date?.value ?? null,
      payType: payType?.value ?? null,
      createByUserId: user.id,
    };

    if (files.length > 0) {
      const lastImage = await this.expenseImageRepository.findOne({
        where: { expenseId: id },
        order: { seq: 'DESC' },
      });

      const lastSeq = lastImage ? lastImage.seq : 0;
      await fs.ensureDir(`${this.uploadsPath}/${values.code}`);
      const imagePromises = files.map(async (file, index) => {
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index + 1}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${values.code}`,
          filename,
        );

        // Stream file processing with Sharp to reduce memory usage
        const readStream = fs.createReadStream(file.filepath);
        const writeStream = fs.createWriteStream(filePath);
        const sharpStream = sharp()
          .png({ quality: 80, progressive: true }) // Progressive PNG for faster rendering
          .on('error', (err) => {
            throw err;
          });

        await new Promise<void>((resolve, reject) => {
          readStream
            .pipe(sharpStream)
            .pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
        });

        return this.expenseImageRepository.create({
          name: filePath,
          expenseId: id,
          userId: values.createByUserId,
          seq: lastSeq,
        });
      });

      const newImages = await Promise.all(imagePromises);
      await this.expenseImageRepository.save(newImages);
    }

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
