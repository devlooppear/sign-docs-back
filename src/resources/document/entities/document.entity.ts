import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Assin } from '../../assin/entities/assin.entity';
import { DocumentStatus } from '../../../common/enum/document-status.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  file_path: string;

  @ManyToOne(() => User, (user) => user.uploaded_documents, { eager: true })
  @JoinColumn({ name: 'uploaded_by_id' })
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

  @OneToMany(() => Assin, (signature) => signature.document, { cascade: true })
  signatures: Assin[];
}
