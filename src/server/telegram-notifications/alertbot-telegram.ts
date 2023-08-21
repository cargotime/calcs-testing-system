import { Injectable } from '@nestjs/common';
import axios from 'axios';

export enum AlertImportance {
  'usual' = 'usual',
  'critical' = 'critical',
}

@Injectable()
export class TelegramAlertBot {
  async alert(
    message: string,
    importance: AlertImportance = AlertImportance.usual,
  ) {
    if (process.env.NODE_ENV === 'production') {
      const requestBody = {
        message: message,
        importance: importance,
        key: process.env.TELEGRAM_TOKEN,
      };

      axios
        .post(process.env.BASE_TELEGRAM_URL, requestBody, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .catch((er) => {
          console.log(
            `Сервис доставки уведомлений временно сломался,` +
              `и следующее сообщение не было доставлено: ${message}\n${er.stack}`,
          );
        });
    } else {
      console.log(
        '\x1b[36m%s\x1b[0m',
        `TELEGRAM [${importance}]\x1b[0m: ${message}`,
      );
    }
  }
}
