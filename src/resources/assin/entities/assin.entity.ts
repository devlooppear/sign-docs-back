import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('signatures')
export class Assin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.signatures, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', unique: true })
  code: number;

  @Column({ nullable: true })
  signature_hash: string;

  @CreateDateColumn()
  signed_at: Date;
}
