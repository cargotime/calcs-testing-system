import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LogbookEntity } from './logbook.entity';
import { CompanyEntity } from './company.entity';

@Entity('job')
export class JobEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'boolean' })
  is_passed: boolean;

  @Column({ type: 'varchar', width: 300, default: true })
  error_msg = '';

  @ManyToOne(() => LogbookEntity, (logbook) => logbook.jobs)
  @JoinColumn({ name: 'logbook_id' })
  logbook: LogbookEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.jobs)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
