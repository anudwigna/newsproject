import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne} from "typeorm";
import { News } from "./News";
import { ObjectType, Field, Int, InputType } from "type-graphql";
import { type } from "os";

@Entity({ name:"sourceLink"})
@ObjectType()
export class SourceLink {

    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({ type: "character varying"})
    @Field()
    url: string;

    @Column({ type: "character varying"})
    @Field()
    title: string;

    @Column({ nullable : true})
    @Field()
    isPrimary: boolean;

    @Column()
    @Field()
    isActive: boolean;

    @ManyToOne(type => News, news => news.sourceLinks, { nullable: false})
    @Field(type => [News])
    news: News;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({nullable: true}) 
    modifiedDate: Date

    @Column({ nullable : true, length: 512})
    adminName: string
}

@InputType()
export class SourceLinkInput{
    @Field( type => Int, { nullable: true})
    id: number

    @Field()
    title: string

    @Field()
    url: string

    @Field()
    isPrimary: boolean
}