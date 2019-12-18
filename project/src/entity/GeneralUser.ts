import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { type } from "os";
import { GeneralUserNewsData } from "./GeneralUserNewsData";
import { Field, Int, InputType, Float } from "type-graphql";
import { GeneralUserCategory } from "./GeneralUserCategory";

@Entity({name: "generalUser"})
export class GeneralUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    providerId: string

    @Column({nullable: true})
    displayName: string

    @Column({nullable: true, length: 1024})
    uid: string

    @Column({nullable: true, length: 1024})
    deviceId: string

    @Column({nullable: true, length: 1024})
    email: string

    @Column({nullable: true, length: 20})
    phoneNumber: string

    @Column({nullable: true, length: 2048})
    photoUrl: string

    @Column({nullable: true, length: 10})
    gender: string

    @Column({nullable: true, length: 20})
    dob: string

    // @Column({nullable: true, type: "geography"})
    // location: string

    @Column()
    isActive: boolean

    @Column()
    isAnonymous: boolean

    @Column()
    isEmailVerified: boolean

    @Column({nullable: true})
    creationTime: Date

    @Column({nullable: true})
    lastSignInTime: Date

    //NAVIGATIONAL PROPERTIES
    @OneToMany(type => GeneralUserNewsData, generalUserNewsRelatedData => generalUserNewsRelatedData.generalUser)
    public generalUserNewsRelatedDatas: GeneralUserNewsData[];

    @OneToMany(type => GeneralUserCategory, generalUserCategory => generalUserCategory.generalUser, {eager: true})
    public generalUserCategories: GeneralUserCategory[];
}

@InputType()
export class GeneralUserNewsDataInput{

    @Field(type => Int)
    newsId: number

    @Field(type => Int, { nullable: true})
    timeSpent: number

    @Field({ nullable: true})
    rating: number
}

@InputType()
export class GeneralUserCategoryInput{

    @Field(type => Int)
    categoryId: number
}
