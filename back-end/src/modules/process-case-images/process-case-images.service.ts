import { Injectable } from '@nestjs/common';
import { CreateProcessCaseImageDto } from './dto/create-process-case-image.dto';
import { UpdateProcessCaseImageDto } from './dto/update-process-case-image.dto';

@Injectable()
export class ProcessCaseImagesService {
  create(createProcessCaseImageDto: CreateProcessCaseImageDto) {
    return 'This action adds a new processCaseImage';
  }

  findAll() {
    return `This action returns all processCaseImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} processCaseImage`;
  }

  update(id: number, updateProcessCaseImageDto: UpdateProcessCaseImageDto) {
    return `This action updates a #${id} processCaseImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} processCaseImage`;
  }
}
