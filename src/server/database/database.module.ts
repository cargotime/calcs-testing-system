import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { JobEntity } from './entities/job.entity';
import { LogbookEntity } from './entities/logbook.entity';
import { CompanyDBConnection } from './providers/company-connection.service';
import { JobDBConnection } from './providers/job-connection.service';
import { LogbookDBConnection } from './providers/logbook-connection.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([CompanyEntity, JobEntity, LogbookEntity]),
  ],
  exports: [CompanyDBConnection, JobDBConnection, LogbookDBConnection],
  providers: [CompanyDBConnection, JobDBConnection, LogbookDBConnection],
})
export class DatabaseModule {}
