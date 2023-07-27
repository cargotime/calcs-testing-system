import { Module } from '@nestjs/common';
import { ConnectionCheckerService } from './connectionChecker.service';
import { DatabaseModule } from 'src/server/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  providers: [ConnectionCheckerService],
  exports: [ConnectionCheckerService],
})
export class ConnectionCheckerModule {}
