import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from './entities/company.entity';
import { JobEntity } from './entities/job.entity';
import { LogbookEntity } from './entities/logbook.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,

    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,

    @InjectRepository(LogbookEntity)
    private logbookRepository: Repository<LogbookEntity>,
  ) {}

  async getAllCompanies(): Promise<CompanyEntity[]> {
    return this.companyRepository.find();
  }

  async getUnavailibleCompanies(): Promise<CompanyEntity[]> {
    const unavailibleCompanies: Promise<CompanyEntity[]> =
      this.companyRepository.find({
        relations: {
          jobs: true,
        },
        where: {
          jobs: {
            is_passed: false,
          },
        },
      });
    return unavailibleCompanies;
  }

  async createJob(): Promise<JobEntity> {
    return this.jobRepository.create();
  }

  async updateJob(job: JobEntity): Promise<JobEntity> {
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

  async createLogbook(): Promise<LogbookEntity> {
    return this.logbookRepository.create();
  }

  async updateLogbook(logbook: LogbookEntity): Promise<LogbookEntity> {
    return this.logbookRepository.save(logbook);
  }
}
