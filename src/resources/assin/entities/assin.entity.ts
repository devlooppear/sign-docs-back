import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Document } from '../../document/entities/document.entity';

@Entity('signatures')
export class Assin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.signatures, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Document, (document) => document.signatures, { eager: true })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ type: 'bigint', unique: true })
  code: number;

  @Column({ nullable: true })
  signature_hash: string;

  @CreateDateColumn()
  signed_at: Date;
}
