import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { GeneralUser } from "./GeneralUser";
import { News } from "./News";
import { Float } from "type-graphql";


@Entity({ name:"generalUserNewsData"})
export class GeneralUserNewsData{
    
    @PrimaryGeneratedColumn()
    public generalUserNewsDataId!: number;

    @Column()
    public generalUserId!: number

    @Column()
    public generalUserUID!: string

    @Column()
    public newsId!: number

    @Column({ nullable: true})
    public timeSpent: number

    @Column("decimal", { nullable: true, precision: 5, scale: 2})
    public rating: number

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn({ nullable: true})
    modifiedDate: Date;

    //NAVIGATIONAL PROPERTIES
    @ManyToOne(type => GeneralUser, generalUser => generalUser.generalUserNewsRelatedDatas)
    public generalUser!: GeneralUser;

    @ManyToOne(type => News, news => news.generalUserNewsRelatedDatas)
    public news!: News;
}