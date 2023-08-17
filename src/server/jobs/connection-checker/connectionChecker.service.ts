import { Injectable } from '@nestjs/common';
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

  private async checkWebsiteAvailability(url: string): Promise<number> {
    try {
      const response = await axios.get(url);
      return response.status;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorCode = axiosError.response?.status;
      return errorCode;
    }
  }

  private async updateCompanies(): Promise<CompanyEntity[]> {
    try {
      const response = await axios.get(`${process.env.BASE_SERVER_URL}`);
      const companies = await response.data;

      await this.companyProvider.updateAll(companies);

      return await this.companyProvider.getAll();
    } catch (error) {
      console.error('Ошибка при обновлении компаний: ', error);
    }
  }

  private async getDisabledCompanies(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${process.env.BASE_SERVER_URL}/disabled`,
      );
      const companies = await response.data;

      return companies;
    } catch (error) {
      console.error(
        'Ошибка при получении списка отключенных компаний: ',
        error,
      );
    }
  }

  private async startJob(
    companies: CompanyEntity[],
    logbook: LogbookEntity,
  ): Promise<void> {
    for (const company of companies) {
      try {
        const job: JobEntity = await this.jobProvider.create(company, logbook);
        const responseCode = await this.checkWebsiteAvailability(company.url);
        if (responseCode === 200) {
          job.is_passed = true;
        } else {
          job.is_passed = false;
          job.error_msg = `Не удалось установить соединение: код ошибки - ${responseCode}`;
        }
        await this.jobProvider.save(job);
      } catch (error) {
        console.error(
          `Ошибка обновления базы данных для компании ${company.name}: ${error}`,
        );
      }
    }
  }

  private async updateDisabledCompanies(
    disabledCompanies: any[],
    failedCheckCompanies: CompanyEntity[],
    date: Date,
  ) {
    const companiesToDisable = failedCheckCompanies
      .filter(
        (company) =>
          !disabledCompanies.some(
            (disabled) => disabled.company.id === company.id,
          ),
      )
      .map((company) => ({
        isAutoDeactivated: true,
        date: date,
        company: company,
      }));

    const companiesToEnable = disabledCompanies.filter(
      (disabled) =>
        !failedCheckCompanies.some(
          (company) => disabled.company.id === company.id,
        ),
    );

    console.log(
      'companiesToDisable: ' +
        companiesToDisable.map((company) => company.company.id),
    );
    console.log(
      'companiesToEnable: ' +
        companiesToEnable.map((company) => company.company.id),
    );

    try {
      if (companiesToDisable.length !== 0) {
        await axios.post(
          `${process.env.BASE_SERVER_URL}/${companiesToDisable}/disable`,
          {
            companyList: companiesToDisable,
          },
        );
      }
      if (companiesToEnable.length !== 0) {
        await axios.post(
          `${process.env.BASE_SERVER_URL}/${companiesToEnable}/enable`,
          {
            companyList: companiesToEnable,
          },
        );
      }
    } catch (error) {
      console.error(
        'Ошибка при отправке списка отключенных компаний на сервер: ',
        error,
      );
    }
  }

  // private async sendTelegramMessage(): Promise<void> {
  //   try {
  //     const unavailibleCompanies =
  //       await this.companyProvider.getUnavailibleCompanies();
  //     let report = 'Список недоступных сайтов и причины их недоступности:\n';
  //     for (const company of unavailibleCompanies) {
  //       const error_msg = await this.jobProvider.getErrorForCompany(company);
  //       report += `Сайт: ${company.name}, Причина: ${error_msg}\n`;
  //     }
  //     // TODO: Реализовать отправку сообщения в телеграм-чат
  //   } catch (error) {
  //     console.error(`Error sending Telegram message: ${error}`);
  //   }
  // }

  @Cron('0 */1 * * * *')
  async checkConnection(): Promise<void> {
    console.log('Check started');
    try {
      const date: Date = new Date();
      const logbook: LogbookEntity = await this.logbookProvider.save(
        date,
        'Проверка соединения',
      );

      const companyList: CompanyEntity[] = await this.updateCompanies();

      const disabledCompanies = await this.getDisabledCompanies();

      await this.startJob(companyList, logbook);

      const failedCheckCompanies: CompanyEntity[] =
        await this.companyProvider.getUnavailible(logbook.id);

      await this.updateDisabledCompanies(
        disabledCompanies,
        failedCheckCompanies,
        date,
      );

      //await this.sendTelegramMessage(); // Отправляем отчет в тг
    } catch (error) {
      console.error(`Ошибка при проверке соединения: ${error}`);
    }
    console.log('Check ended');
  }
}
