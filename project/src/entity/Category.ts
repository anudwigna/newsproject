import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";
import { ObjectType, Field, Int, InputType, Authorized } from "type-graphql";
import { GeneralUserCategory } from "./GeneralUserCategory";

@Entity()
@ObjectType()
export class Category {

    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({ type: "character varying", length: 512})
    @Field()
    name: string;

    @Column({ type: "character varying", length: 512, nullable:true})
    @Field({ nullable: true})
    imageName: string;

    @Column({ type: "character varying", length: 512})
    @Field()
    alias: string;

    @Column()
    @Field()
    isActive: boolean;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({nullable: true}) 
    modifiedDate: Date

    url: string

    @Column({ nullable : true, length: 512})
    adminName: string

    //NAVIGATIIONAL PROPERTIES
    @OneToMany(type => GeneralUserCategory, generalUserCategory => generalUserCategory.category)
    public generalUserCategories: GeneralUserCategory[];
}

@InputType()
export class CategoryInput{
    @Field(type => Int, { nullable : true})
    id: number

    @Field()
    name: string

    @Field()
    alias: string
}