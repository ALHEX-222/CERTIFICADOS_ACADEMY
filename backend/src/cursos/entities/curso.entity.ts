import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id_curso: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 50, nullable: true })
  duracion: string;

  @Column({ type: 'text', nullable: true })
  texto_certificado: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 20, default: 'Activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}