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

  async createLogbook(): Promise<LogbookEntity> {
    return this.logbookRepository.create();
  }

  async updateLogbook(logbook: LogbookEntity): Promise<LogbookEntity> {
    return this.logbookRepository.save(logbook);
  }
}
