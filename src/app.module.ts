import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './server/database/database.module';
import { WebSocketModule } from './server/websocket/websocket.module';
import { ConnectionCheckerModule } from './server/jobs/connection-checker/connectionChecker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    WebSocketModule,
    ConnectionCheckerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
