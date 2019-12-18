import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int } from "type-graphql";
import { getConnection, Not, Repository, Like } from "typeorm";
import { TokenUtility } from "../../Utilities/TokenUtility";
import { Category, CategoryInput } from "../../entity/Category";
import { GlobalConfig } from "../../config/GlobalConfig";

@Resolver(Category)
export class CategoryResolver{

    private _categoryRepo : Repository<Category>;

    constructor(){
        this._categoryRepo = getConnection().getRepository(Category);
    }

    adjustCategoryImage(categories: Category[]): Category[]{
        categories.forEach(category => {
            category.imageName = GlobalConfig.CATEGORY_PHOTO_PATH + category.imageName;
        });
        return categories;
    }
    
    @Query(returns => [Category])
    @Authorized("GeneralUser")
    async categories(
        @Arg("filterByName", { nullable : true}) filter : string 
    ){
        try{
            if(filter){
                let list: Category[] =  await this._categoryRepo.find({name: Like(`%${filter}%`)});
                return this.adjustCategoryImage(list);
            }else{
                let list: Category[] =  await this._categoryRepo.find();
                return this.adjustCategoryImage(list);
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Query(returns => [Category])
    @Authorized("Admin")
    async categoriesForAdmin(
        @Arg("filterByName", { nullable : true}) filter : string 
    ){
        try{
            if(filter){
                let list: Category[] =  await this._categoryRepo.find({name: Like(`%${filter}%`)});
                return this.adjustCategoryImage(list);
            }else{
                let list: Category[] =  await this._categoryRepo.find();
                return this.adjustCategoryImage(list);
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Mutation(returns => Category)
    @Authorized("Admin")
    async insertCategory(
            @Arg("category") categoryInput: CategoryInput,
            @Ctx("token") token: string
        ): Promise<Category>{
        try{
            let theExistingCategory: Category = await this._categoryRepo.findOne({name: categoryInput.name});
            if(theExistingCategory)
                throw new Error("This Category already exists!");
            
            let category: Category = new Category();
            category.name = categoryInput.name.trim(),
            category.alias = categoryInput.alias.trim(),
            category.isActive = true;
            category.adminName = TokenUtility.getUsernameFromToken(token); 
            return await this._categoryRepo.save(category);
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Mutation(returns => Category)
    @Authorized("Admin")
    async updateCategory(
            @Arg("category") categoryInput: CategoryInput,
            @Ctx("token") token: string
        ): Promise<Category>{
            try{
                if(categoryInput.id === 0 || categoryInput.id === null)
                    throw new Error("The Category object is not valid!");
                
                let theExistingCategory2: Category = await this._categoryRepo.findOne({ id: categoryInput.id});
                if(!theExistingCategory2){
                    throw new Error("The Category with the supplied Id does not exists!");
                }

                //checking for existing category
                let theExistingCategory: Category = await this._categoryRepo.findOne({name: categoryInput.name, id: Not(categoryInput.id)});
                if(theExistingCategory)
                    throw new Error("This Category already exists!");

                let category: Category = new Category();
                category.id = categoryInput.id;
                category.name = categoryInput.name.trim();
                category.alias = categoryInput.alias.trim();
                category.isActive = true;
                category.adminName = TokenUtility.getUsernameFromToken(token); 
                return await this._categoryRepo.save(category);
            }
            catch(er){
                throw new Error(er.message);
            }
    }

    @Mutation(returns => Category)
    @Authorized("Admin")
    async deleteCategory(
        @Arg("id", type => Int) catId: number,
        @Ctx("token") token: string
    ): Promise<Category>{
        try{
            let theExistingCategory: Category = await this._categoryRepo.findOne({ id: catId});
            if(!theExistingCategory){
                throw new Error("The Category with the supplied Id does not exists!");
            }
            return await this._categoryRepo.remove(theExistingCategory);
        }
        catch(er){
            throw new Error(er.message);
        }
    }
}