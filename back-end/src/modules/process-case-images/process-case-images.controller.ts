import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProcessCaseImagesService } from './process-case-images.service';
import { CreateProcessCaseImageDto } from './dto/create-process-case-image.dto';
import { UpdateProcessCaseImageDto } from './dto/update-process-case-image.dto';

@Controller('process-case-images')
export class ProcessCaseImagesController {
  constructor(private readonly processCaseImagesService: ProcessCaseImagesService) {}

  @Post()
  create(@Body() createProcessCaseImageDto: CreateProcessCaseImageDto) {
    return this.processCaseImagesService.create(createProcessCaseImageDto);
  }

  @Get()
  findAll() {
    return this.processCaseImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processCaseImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProcessCaseImageDto: UpdateProcessCaseImageDto) {
    return this.processCaseImagesService.update(+id, updateProcessCaseImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processCaseImagesService.remove(+id);
  }
}
