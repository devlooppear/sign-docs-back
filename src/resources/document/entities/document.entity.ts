import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Assin } from '../../assin/entities/assin.entity';
import { DocumentStatus } from '../../../common/enum/document-status.enum';

@Entity('documentos')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  file_path: string;

  @ManyToOne(() => User, (user) => user.documentos)
  uploaded_by: User;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.AVAILABLE,
  })
  status: DocumentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Assin, (assinatura) => assinatura.document)
  assinaturas: Assin[];
}
