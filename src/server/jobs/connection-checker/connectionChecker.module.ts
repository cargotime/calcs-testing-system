import { Module } from '@nestjs/common';
import { ConnectionCheckerService } from './connectionChecker.service';
import { DatabaseModule } from 'src/server/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramAlertBot } from 'src/server/telegram-notifications/alertbot-telegram';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  providers: [ConnectionCheckerService, TelegramAlertBot],
  exports: [ConnectionCheckerService],
})
export class ConnectionCheckerModule {}
