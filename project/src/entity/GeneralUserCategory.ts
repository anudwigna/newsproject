import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { GeneralUser } from "./GeneralUser";
import { Category } from "./Category";


@Entity({ name:"generalUserCategory"})
export class GeneralUserCategory{
    
    @PrimaryGeneratedColumn()
    public generalUserCategoryId!: number;

    @Column()
    public generalUserId!: number

    @Column()
    public generalUserUID!: string

    @Column()
    public categoryId!: number

    @CreateDateColumn()
    createdDate: Date;

    //NAVIGATIONAL PROPERTIES
    @ManyToOne(type => GeneralUser, generalUser => generalUser.generalUserCategories)
    public generalUser!: GeneralUser;

    @ManyToOne(type => Category, category => category.generalUserCategories)
    public category!: Category;
}