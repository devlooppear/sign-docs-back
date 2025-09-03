import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Document } from '../../document/entities/document.entity';

@Entity('assinaturas')
export class Assin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.assinaturas, { eager: true })
  user: User;

  @ManyToOne(() => Document, (document) => document.assinaturas, {
    eager: true,
  })
  document: Document;

  @Column()
  cpf_cnpj: string;

  @Column({ type: 'bigint' })
  codigo: number;

  @Column({ nullable: true })
  signature_hash: string;

  @CreateDateColumn()
  signed_at: Date;
}
