import { Get, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { CompanyEntity } from 'src/server/database/entities/company.entity';
import { JobEntity } from 'src/server/database/entities/job.entity';
import { Cron } from '@nestjs/schedule';
import { LogbookEntity } from 'src/server/database/entities/logbook.entity';
import { CompanyDBConnection } from 'src/server/database/providers/company-connection.service';
import { JobDBConnection } from 'src/server/database/providers/job-connection.service';
import { LogbookDBConnection } from 'src/server/database/providers/logbook-connection.service';

@Injectable()
export class ConnectionCheckerService {
  constructor(
    private companyProvider: CompanyDBConnection,
    private jobProvider: JobDBConnection,
    private logbookProvider: LogbookDBConnection,
  ) {}

  private async checkCompanyAvailability(url: string): Promise<number> {
    try {
      const response = await axios.get(url);
      return response.status;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorCode = axiosError.response?.status;
      return errorCode;
    }
  }

  private async updateCompanyList(): Promise<void> {
    try {
      const response = await axios.get('http://calc_nest_core:3002/companies');
      const companies = await response.data;
      
      await this.companyProvider.updateAllCompanies(companies);
  
    } catch (error) {
      console.error('Ошибка при обновлении списка компаний: ', error);
    }
  }

  private async startJob(): Promise<void> {
    const companies: CompanyEntity[] = await this.companyProvider.getAllCompanies();
    const logbook: LogbookEntity = await this.logbookProvider.createLogbook();
    logbook.date = new Date();
    logbook.job_type = 'Проверка соединения';
    await this.logbookProvider.updateLogbook(logbook);
    for (const company of companies) {
      try {
        const job: JobEntity = await this.jobProvider.createJob();
        job.company = company;
        job.logbook = logbook;
        const responseCode = await this.checkCompanyAvailability(company.url);
        if (responseCode === 200) {
          job.is_passed = true;
        } else {
          job.is_passed = false;
          job.error_msg = `Не удалось установить соединение: код ошибки ${responseCode}`;
        }
        await this.jobProvider.updateJob(job);
      } catch (error) {
        console.error(
          `Error updating database for company ${company.name}: ${error}`,
        );
      }
    }
  }

  private async sendTelegramMessage(): Promise<void> {
    try {
      const unavailibleCompanies =
        await this.companyProvider.getUnavailibleCompanies();
      let report = 'Список недоступных сайтов и причины их недоступности:\n';
      for (const company of unavailibleCompanies) {
        const error_msg = await this.jobProvider.getErrorForCompany(company);
        report += `Сайт: ${company.name}, Причина: ${error_msg}\n`;
      }
      // TODO: Реализовать отправку сообщения в телеграм-чат
    } catch (error) {
      console.error(`Error sending Telegram message: ${error}`);
    }
  }

  private async sendUnavailableCompaniesToServer(): Promise<void> {
    const unavailibleCompanies =
      await this.companyProvider.getUnavailibleCompanies();
    // Код для отправки списка недоступных сайтов на calcs-nest
    // ...
  }

  @Cron('0 */1 * * * *')
  async checkConnections(): Promise<void> {
    console.log('Check started');
    try {
      await this.updateCompanyList();
      await this.startJob(); 
      //await this.sendUnavailableCompaniesToServer(); // Отправляем список в calcs-nest
      //await this.sendTelegramMessage(); // Отправляем отчет в тг
    } catch (error) {
      console.error(`Error checking connections: ${error}`);
    }
    console.log('Check ended');
  }
}
