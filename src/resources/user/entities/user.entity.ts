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
import { TipoPessoa } from '../../../common/enum/tipo-pessoa.enum';
import { UserRole } from '../../../common/enum/user-role.enum';

@Entity('usuarios')
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
  tipo_pessoa: TipoPessoa;

  @Column()
  documento: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Document, (documento) => documento.uploaded_by)
  documentos: Document[];

  @OneToMany(() => Assin, (assinatura) => assinatura.user)
  assinaturas: Assin[];
}
