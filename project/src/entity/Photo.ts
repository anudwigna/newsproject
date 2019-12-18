import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, OneToMany} from "typeorm";
import { News } from "./News";
import { ObjectType, Field, InputType, Int } from "type-graphql";

@Entity()
@ObjectType()
export class Photo {

    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({ type: "character varying", length: 512})
    @Field({ nullable: true})
    name: string;

    @Column({ type: "character varying", length: 2048, nullable: true})
    @Field({ nullable: true})
    description: string;

    @Column()
    @Field()
    isActive: boolean;

    @OneToMany(type => News, news => news.photo)
    @Field(type => [News])
    news: News[];

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({nullable: true}) 
    modifiedDate: Date

    @Column({ nullable : true, length: 512})
    adminName: string

    @Field({nullable: false})
    fullUrl: string;
}

@InputType()
export class PhotoInput{
    @Field(type => Int, { nullable : true})
    id: number

    @Field()
    description: string

    @Field({ nullable: true})
    contentString: string
}