import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Category, CategoryInput } from './Category';
import { Tag, TagInput } from "./Tag";
import { SourceLink, SourceLinkInput } from "./SourceLink";
import { Photo, PhotoInput } from "./Photo";
import { ObjectType, Field, Int, InputType } from "type-graphql";
import { GeneralUserNewsData } from "./GeneralUserNewsData";

@Entity()
@ObjectType()
export class News {

    @PrimaryGeneratedColumn()
    @Field(type => Int)
    id: number;

    @Column({ type : "character varying", length : 512})
    @Field()
    title: string;

    @Column()
    @Field()
    content: string;

    @Column()
    @Field()
    publishedDate: Date

    @Column({ type:'character varying', length:12})
    @Field()
    publishedDateBS: string

    @Column()
    @Field()
    isPublished: boolean;

    @Column()
    @Field()
    isActive: boolean;

    @OneToMany(type => SourceLink, link => link.news, { eager: true})
    @Field(type => [SourceLink])
    sourceLinks: SourceLink[];

    @ManyToMany(type => Category, { onDelete: 'CASCADE', eager: true})
    @JoinTable({ name: "newsCategory"})
    @Field(type => [Category])
    categories: Category[];

    @ManyToMany(type => Tag, { onDelete : 'CASCADE', eager: true})
    @JoinTable({ name: "newsTag"})
    @Field(type => [Tag])
    tags: Tag[];

    @ManyToOne(type => Photo, photo => photo.news, { onDelete:"RESTRICT", eager: true})
    @Field(type => Photo)
    photo: Photo;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({nullable: true}) 
    modifiedDate: Date

    @Column({type: "character varying", length:512})
    adminName: string

    //NAVIGATIONAL PROPERTIES
    @OneToMany(type => GeneralUserNewsData, generalUserNewsRelatedData => generalUserNewsRelatedData.news)
    public generalUserNewsRelatedDatas: GeneralUserNewsData[];
}

@InputType()
export class NewsInput{
    
    @Field(type => Int, { nullable : true})
    id: number

    @Field()
    content: string

    @Field()
    title: string

    @Field()
    publishedDate: Date

    @Field()
    publishedDateBS: string

    @Field(type => [CategoryInput])
    categories: [CategoryInput]

    @Field(type => [TagInput])
    tags: [TagInput]

    @Field(type => [SourceLinkInput])
    sourceLinks: [SourceLinkInput]

    @Field(type => PhotoInput)
    photo: Photo
}
