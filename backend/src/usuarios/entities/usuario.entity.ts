import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude as ExcludeTransform } from 'class-transformer';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ default: 1 })
  id_rol: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20, nullable: true })
  dni: string;

  @Column({ length: 150, unique: true })
  email: string;

  @ExcludeTransform()
  @Column({ length: 255 })
  password: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  imagen_perfil: string;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ type: 'tinyint', default: 0 })
  email_verificado: boolean;

  @Column({ length: 20, default: 'Activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  fecha_registro: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso: Date;

  @DeleteDateColumn({ type: 'datetime', precision: 6, nullable: true })
  deleted_at: Date;
}