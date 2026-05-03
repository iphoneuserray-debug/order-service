import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PickupLocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column({ default: true })
    active: boolean;
}
