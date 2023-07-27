import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JobEntity } from './job.entity';

@Entity('logbook')
export class LogbookEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  logbook_id: number;

  @Column({ type: 'varchar', width: 200 })
  job_type: string;

  @Column({ type: 'datetime' })
  date: Date;

  @OneToMany(() => JobEntity, (job) => job.logbook)
  jobs: JobEntity[];
}
