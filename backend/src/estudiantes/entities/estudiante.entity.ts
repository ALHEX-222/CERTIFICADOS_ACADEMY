import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estudiantes')
export class Estudiante {
  @PrimaryGeneratedColumn()
  id_estudiante: number;

  @Column({ length: 150 })
  nombre_completo: string;

  @Column({ length: 30, unique: true })
  numero_documento: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 20, default: 'Activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}