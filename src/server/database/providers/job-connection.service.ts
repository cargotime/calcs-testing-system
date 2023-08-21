import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { JobEntity } from '../entities/job.entity';
import { LogbookEntity } from '../entities/logbook.entity';

@Injectable()
export class JobDBConnection {
  constructor(
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
  ) {}

  async create(
    company: CompanyEntity,
    logbook: LogbookEntity,
  ): Promise<JobEntity> {
    return this.jobRepository.create({
      company: company,
      logbook: logbook,
    });
  }

  async save(job: JobEntity): Promise<JobEntity> {
    return this.jobRepository.save(job);
  }

  async getErrorForCompany(company: CompanyEntity): Promise<string> {
    const error: Promise<JobEntity[]> = this.jobRepository.find({
      relations: {
        company: true,
        logbook: true,
      },
      where: {
        company: company,
      },
      select: {
        error_msg: true,
      },
    });
    return error[0].error_msg;
  }
}
