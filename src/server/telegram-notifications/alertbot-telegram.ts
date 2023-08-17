import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramAlertBot {
  async alert(message: string, importance = 'usual') {
    const fetch = require('node-fetch');

    if (process.env.NODE_ENV === 'production') {
      const requestBody = {
        message: message,
        importance: importance,
        key: process.env.TELEGRAM_TOKEN,
      };

      fetch(process.env.BASE_TELEGRAM_URL, {
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(requestBody),
      }).catch((er) => {
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
