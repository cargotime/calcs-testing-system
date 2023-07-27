import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
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
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
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
