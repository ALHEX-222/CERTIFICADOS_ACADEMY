import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('modelos_certificados')
export class ModelosCertificado {
  @PrimaryGeneratedColumn()
  id_modelo: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 255 })
  url_imagen: string;

  @Column({ length: 20, default: 'horizontal' })
  orientacion: string;

  @Column({ type: 'json', nullable: true })
  campos_config: Record<string, any>[];

  @Column({ length: 20, default: 'Activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}