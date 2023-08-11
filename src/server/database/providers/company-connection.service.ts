import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyDBConnection {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async updateAllCompanies(companies: any[]) {
    await this.companyRepository.upsert(companies, ['id']);
  }

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
}
