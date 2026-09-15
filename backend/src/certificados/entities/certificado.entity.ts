import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from '../../estudiantes/entities/estudiante.entity';
import { Curso } from '../../cursos/entities/curso.entity';

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn()
  id_certificado: number;

  @ManyToOne(() => Estudiante, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_estudiante' })
  estudiante: Estudiante;

  @Column()
  id_estudiante: number;

  @ManyToOne(() => Curso, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_curso' })
  curso: Curso;

  @Column()
  id_curso: number;

  @Column({ length: 200 })
  nombre_estudiante: string;

  @Column({ length: 20, nullable: true })
  dni_estudiante: string;

  @Column({ length: 200 })
  nombre_curso: string;

  @Column({ length: 100, unique: true })
  codigo_certificado: string;

  @Column({ length: 50, default: 'Certificado de Aprobación' })
  tipo_certificado: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  horas: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_emision: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_vencimiento: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  calificacion_final: number;

  @Column({ length: 255, nullable: true })
  email_destinatario: string;

  @Column({ length: 20, default: 'Activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}