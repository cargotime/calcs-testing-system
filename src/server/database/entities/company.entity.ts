import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JobEntity } from './job.entity';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', width: 200 })
  name: string;

  @Column({ type: 'varchar', width: 200 })
  url: string;

  @OneToMany(() => JobEntity, (job) => job.company)
  jobs: JobEntity[];
}
