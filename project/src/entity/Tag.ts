import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
import { ObjectType, Field, Int, InputType, Authorized } from 'type-graphql';

@Entity()
@ObjectType()
export class Tag {

    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({ type: "character varying", length: 512})
    @Field()
    name: string;

    @Column({ type: "character varying", length: 512})
    @Field()
    alias: string;

    @Column()
    @Field({ nullable: true})
    isActive: boolean;

    @Column({ nullable: true})
    @Field( type => Boolean, { nullable: true})
    isTopic: boolean;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({nullable: true}) 
    modifiedDate: Date

    @Column({ nullable : true, length: 512})
    adminName: string

}

@InputType()
export class TagInput{
    @Field(type => Int, { nullable : true})
    id: number

    @Field()
    name: string

    @Field()
    alias: string

    @Field()
    isTopic: boolean
}