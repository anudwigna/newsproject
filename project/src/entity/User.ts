import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({nullable: true})
    name: string

    @Column({nullable: true})
    uid: string

    @Column({nullable: true})
    age: number

    @Column({nullable: true, length: 1024})
    email: string

    @Column({nullable: true, length: 20})
    phoneNumber: string

    @Column()
    isActive: boolean

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn() 
    modifiedDate: Date
}
