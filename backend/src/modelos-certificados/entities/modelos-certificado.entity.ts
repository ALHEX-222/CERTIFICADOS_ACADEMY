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

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 255, nullable: true })
  imagen: string;

  @Column({ length: 20, default: 'horizontal' })
  orientacion: string;

  // Posiciones de cada campo de texto sobre la imagen (para cuando se genere el PDF)
  @Column({ type: 'json', nullable: true })
  campos_config: Record<string, any>[];

  @Column({ length: 20, default: 'activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}