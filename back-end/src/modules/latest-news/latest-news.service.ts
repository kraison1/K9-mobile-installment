import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestNewsSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { isEmpty } from 'lodash';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { LatestNew } from './entities/latest-new.entity';

@Injectable()
export class LatestNewsService {
  private readonly uploadsPath = path.join('uploads/latestNews');

  constructor(
    @InjectRepository(LatestNew)
    private readonly latestNewsRepository: Repository<LatestNew>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const { name, content, linkUrl, active, fileLatestNew } = req.body as any;

    // Validate required fields
    if (!name?.value || !content?.value) {
      return {
        message_error: 'กรุณากรอกข้อมูลที่จำเป็น: name, content',
      };
    }

    let filePath = '';
    let fileLatestNewPath = fileLatestNew?.value ?? '';

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${Date.now()}.png`; // Use timestamp to avoid conflicts
      filePath = path.join(this.uploadsPath, filename);
      fileLatestNewPath = filePath;

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    const createLatestNewsDto: Partial<LatestNew> = {
      name: name.value,
      content: content.value,
      linkUrl: linkUrl?.value ?? null,
      active: active?.value ?? '1',
      fileLatestNew: fileLatestNewPath,
    };

    const newLatestNews = this.latestNewsRepository.create(createLatestNewsDto);
    await this.latestNewsRepository.save(newLatestNews);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchLatestNewsDto: LatestNewsSearchDto): Promise<{
    data: LatestNew[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.latestNewsRepository.createQueryBuilder('latestNews');

    queryBuilder.select([
      'latestNews.id',
      'latestNews.name',
      'latestNews.content',
      'latestNews.linkUrl',
      'latestNews.active',
      'latestNews.fileLatestNew',
    ]);

    if (searchLatestNewsDto.active !== '2') {
      queryBuilder.andWhere('latestNews.active = :active', {
        active: searchLatestNewsDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('latestNews.name', 'ASC')
      .skip((searchLatestNewsDto.page - 1) * searchLatestNewsDto.pageSize)
      .take(searchLatestNewsDto.pageSize);

    const latestNewses = await queryBuilder.getMany();

    return {
      data: latestNewses,
      total,
      page: searchLatestNewsDto.page,
      pageSize: searchLatestNewsDto.pageSize,
    };
  }

  async findOne(id: number): Promise<any> {
    const latestNews = await this.latestNewsRepository.findOne({
      where: { id },
    });
    return latestNews;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const { name, content, linkUrl, active, fileLatestNew } = req.body as any;

    const existingLatestNews = await this.latestNewsRepository.findOne({
      where: { id },
    });

    if (!existingLatestNews) {
      return { message_error: `LatestNew with ID ${id} not found` };
    }

    let filePath = existingLatestNews.fileLatestNew;
    let fileLatestNewPath =
      fileLatestNew?.value ?? existingLatestNews.fileLatestNew;

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${Date.now()}.png`; // Use timestamp to avoid conflicts
      filePath = path.join(this.uploadsPath, filename);
      fileLatestNewPath = filePath;

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    const updateData: Partial<LatestNew> = {
      name: name?.value ?? existingLatestNews.name,
      content: content?.value ?? existingLatestNews.content,
      linkUrl: linkUrl?.value ?? existingLatestNews.linkUrl,
      active: active?.value ?? existingLatestNews.active,
      fileLatestNew: fileLatestNewPath,
    };

    await this.latestNewsRepository.update(id, updateData);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateData.name}`,
    };
  }
}
