import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Assin } from '../../assin/entities/assin.entity';
import { Document } from '../../document/entities/document.entity';
import { UserRole } from '../../../common/enum/user-role.enum';
import { TipoPessoa } from '../../../common/enum/tipo-pessoa.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: TipoPessoa })
  person_type: TipoPessoa;

  @Column()
  document_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Document, (document) => document.uploaded_by)
  uploaded_documents: Document[];

  @OneToMany(() => Assin, (assinatura) => assinatura.user)
  signatures: Assin[];
}
