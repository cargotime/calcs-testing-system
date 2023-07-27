import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/server/database/database.service';
import axios, { AxiosError } from 'axios';
import { CompanyEntity } from 'src/server/database/entities/company.entity';
import { JobEntity } from 'src/server/database/entities/job.entity';
import { Cron } from '@nestjs/schedule';
import { LogbookEntity } from 'src/server/database/entities/logbook.entity';

@Injectable()
export class ConnectionCheckerService {
  constructor(private DBConnection: DatabaseService) {}

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

  private async updateDatabase(companies: CompanyEntity[]): Promise<void> {
    const logbook: LogbookEntity = await this.DBConnection.createLogbook();
    logbook.date = new Date();
    logbook.job_type = 'Проверка соединения';
    await this.DBConnection.updateLogbook(logbook);
    for (const company of companies) {
      try {
        const job: JobEntity = await this.DBConnection.createJob();
        job.company = company;
        job.logbook = logbook;
        const responseCode = await this.checkCompanyAvailability(company.url);
        if (responseCode === 200) {
          job.is_passed = true;
        } else {
          job.is_passed = false;
          job.error_msg = `Не удалось установить соединение: код ошибки ${responseCode}`;
        }
        await this.DBConnection.updateJob(job);
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
        await this.DBConnection.getUnavailibleCompanies();
      let report = 'Список недоступных сайтов и причины их недоступности:\n';
      for (const company of unavailibleCompanies) {
        const error_msg = await this.DBConnection.getErrorForCompany(company);
        report += `Сайт: ${company.name}, Причина: ${error_msg}\n`;
      }
      // TODO: Реализовать отправку сообщения в телеграм-чат
    } catch (error) {
      console.error(`Error sending Telegram message: ${error}`);
    }
  }

  private async sendUnavailableCompaniesToServer(): Promise<void> {
    const unavailibleCompanies =
      await this.DBConnection.getUnavailibleCompanies();
    // Код для отправки списка недоступных сайтов на calcs-nest
    // ...
  }

  @Cron('0 */10 * * * *')
  async checkConnections(): Promise<void> {
    console.log('Check started');
    try {
      const companies = await this.DBConnection.getAllCompanies();
      await this.updateDatabase(companies); // Обновляем базу данных с результатами проверки
      //await this.sendUnavailableCompaniesToServer(); // Отправляем список в calcs-nest
      //await this.sendTelegramMessage(); // Отправляем отчет в тг
    } catch (error) {
      console.error(`Error checking connections: ${error}`);
    }
    console.log('Check ended');
  }
}
