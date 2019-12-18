import { Resolver, Query, Mutation, Arg, Ctx, Authorized, InputType, Int } from "type-graphql";
import { Tag, TagInput } from "../../entity/Tag";
import { getConnection, Not, Repository, Like } from "typeorm";
import { TokenUtility } from "../../Utilities/TokenUtility";

@Resolver(Tag)
export class TagResolver{
    
    private _tagRepo : Repository<Tag>;

    constructor(){
        const driver = getConnection().driver as any;
        driver.postgres.defaults.parseInputDatesAsUTC = true;
        this._tagRepo = getConnection().getRepository(Tag);
    }
    
    @Query(returns => [Tag])
    @Authorized("GeneralUser")
    async tags(
        @Arg("filterByName", { nullable : true}) filter : string 
    ){
        try{
            if(filter){
                let tagList = await this._tagRepo
                .createQueryBuilder("tags")
                .where(`lower(tags.name) like '%${filter.toLowerCase()}%' OR lower(tags.alias) like '%${filter.toLowerCase()}%'`)
                .orderBy("tags.id", "DESC")
                .getMany();
                return tagList;
            }else{
                return await this._tagRepo.find();
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Query(returns => [Tag])
    @Authorized("Admin")
    async tagsForAdmin(
        @Arg("filterByName", { nullable : true}) filter : string 
    ){
        try{
            if(filter){
                return await this._tagRepo.find({name: Like(`%${filter}%`)});
            }else{
                return await this._tagRepo.find();
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Mutation(returns => Tag)
    @Authorized("Admin")
    async insertTag(
            @Arg("tag") tagInput: TagInput,
            @Ctx("token") token: string
        ): Promise<Tag>{

        let theExistingTag: Tag = await this._tagRepo.findOne({name: tagInput.name});
        if(theExistingTag)
            throw new Error("This tag already exists!");
        
        let tag: Tag = new Tag();
        tag.name = tagInput.name.trim(),
        tag.alias = tagInput.alias.trim(),
        tag.isActive = true;
        tag.isTopic = tagInput.isTopic;
        tag.adminName = TokenUtility.getUsernameFromToken(token); 

        return await this._tagRepo.save(tag);
    }

    @Mutation(returns => Tag)
    @Authorized("Admin")
    async updateTag(
            @Arg("tag") tagInput: TagInput,
            @Ctx("token") token: string
        ): Promise<Tag>{
            try{
                if(tagInput.id === 0 || tagInput.id === null)
                    throw new Error("The tag object is not valid!");
                
                let theExistingTag2: Tag = await this._tagRepo.findOne({ id: tagInput.id});
                if(!theExistingTag2){
                    throw new Error("The tag with the supplied Id does not exists!");
                }

                //checking for existing tag
                let theExistingTag: Tag = await this._tagRepo.findOne({name: tagInput.name, id: Not(tagInput.id)});
                if(theExistingTag)
                    throw new Error("This tag already exists!");

                let tag: Tag = new Tag();
                tag.id = tagInput.id;
                tag.name = tagInput.name.trim();
                tag.alias = tagInput.alias.trim();
                tag.isActive = true;
                tag.isTopic = tagInput.isTopic;
                tag.adminName = TokenUtility.getUsernameFromToken(token); 
                return await this._tagRepo.save(tag);
            }
            catch(er){
                throw new Error(er.message);
            }
    }

    @Mutation(returns => Tag)
    @Authorized("Admin")
    async deleteTag(
        @Arg("id", type => Int) tagId: number,
        @Ctx("token") token: string
    ): Promise<Tag>{
        try{
            let theExistingTag: Tag = await this._tagRepo.findOne({ id: tagId});
            if(!theExistingTag){
                throw new Error("The tag with the supplied Id does not exists!");
            }
            return await this._tagRepo.remove(theExistingTag);
        }
        catch(er){
            throw new Error(er.message);
        }
    }
}