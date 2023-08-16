import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogbookEntity } from '../entities/logbook.entity';

@Injectable()
export class LogbookDBConnection {
  constructor(
    @InjectRepository(LogbookEntity)
    private logbookRepository: Repository<LogbookEntity>,
  ) {}

  async save(date: Date, job_type: string): Promise<LogbookEntity> {
    return this.logbookRepository.save({
      date: date,
      job_type: job_type,
    });
  }
}
