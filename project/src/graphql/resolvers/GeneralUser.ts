import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int } from "type-graphql";
import { getConnection, Not, Repository, Like } from "typeorm";
import { GeneralUser, GeneralUserNewsDataInput, GeneralUserCategoryInput } from "../../entity/GeneralUser";
import { GeneralUserNewsData } from "../../entity/GeneralUserNewsData";
import { GeneralUserCategory } from "../../entity/GeneralUserCategory";

@Resolver(GeneralUser)
export class GeneralUserResolver{

    private _generalUserRepo : Repository<GeneralUser>;
    private _generalUserNewsDataRepo: Repository<GeneralUserNewsData>;
    private _generalUserCategoryrepo: Repository<GeneralUserCategory>;

    constructor(){
        this._generalUserRepo = getConnection().getRepository(GeneralUser);
        this._generalUserNewsDataRepo = getConnection().getRepository(GeneralUserNewsData);
        this._generalUserCategoryrepo = getConnection().getRepository(GeneralUserCategory);
    }

    @Mutation(returns => String)
    @Authorized("GeneralUser")
    async updateGeneralUserNewsData(
            @Arg("generalUserNewsData") generalUserNewsDataInput: GeneralUserNewsDataInput,
            @Ctx("uid") uid: string
        ): Promise<string>{
        try{
            let theUser = await this._generalUserRepo.findOne({ uid: uid});
            if(!theUser)
                throw new Error("The user with this UID is not registered in the system.");

            let theExistingData = await this._generalUserNewsDataRepo.findOne({ newsId: generalUserNewsDataInput.newsId, generalUserUID: uid});

            if(!theExistingData){
                let theData = new GeneralUserNewsData();
                theData.newsId = generalUserNewsDataInput.newsId;
                theData.generalUserUID = uid;
                theData.generalUserId = theUser.id;
                theData.timeSpent = generalUserNewsDataInput.timeSpent;
                theData.rating = generalUserNewsDataInput.rating;
                await this._generalUserNewsDataRepo.save(theData);
            }else{
                theExistingData.timeSpent = generalUserNewsDataInput.timeSpent;
                theExistingData.rating = generalUserNewsDataInput.rating;
                await this._generalUserNewsDataRepo.save(theExistingData);
            }

            return "The Data has been Updated.";
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Mutation(returns => String)
    @Authorized("GeneralUser")
    async updateGeneralUserCategory(
        @Arg("generalUserCategories", type => [GeneralUserCategoryInput]) generalUserCategories: GeneralUserCategoryInput[],
        @Ctx("uid") uid: string
    ): Promise<string> {
        try {

            let theUser = await this._generalUserRepo.findOne({ uid: uid });
            if (!theUser)
                throw new Error("The user with this UID is not registered in the system.");

            let existingUserCategories: GeneralUserCategory[] =
                await this._generalUserCategoryrepo.find({ generalUserUID: uid });

            let theInsertArray: GeneralUserCategory[] = [];
            generalUserCategories.forEach((item) => {
                let _temp = new GeneralUserCategory();
                _temp.generalUserUID = uid;
                _temp.categoryId = item.categoryId;
                _temp.generalUserId = theUser.id;
                theInsertArray.push(_temp);
            });

            if (existingUserCategories.length > 0) {

                theInsertArray.forEach(async newCategory => {
                    try {
                        if (!existingUserCategories
                            .find(
                                x => x.generalUserUID == newCategory.generalUserUID &&
                                    x.categoryId == newCategory.categoryId
                            )
                        ) {
                            await this._generalUserCategoryrepo.save(newCategory);
                        }
                    } catch (ex) {
                        console.log(ex.message);
                    }
                });

                existingUserCategories.forEach(async existingCategory => {
                    try {
                        if (!theInsertArray
                            .find(
                                x => x.generalUserUID == existingCategory.generalUserUID &&
                                    x.categoryId == existingCategory.categoryId
                            )
                        ) {
                            await this._generalUserCategoryrepo.remove(existingCategory);
                        }
                    } catch (ex) {
                        console.log(ex.message);
                    }
                });
            } else {
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(GeneralUserCategory)
                    .values(theInsertArray)
                    .execute();
            }
            return "The Data has been Updated.";
        } catch (er) {
            throw new Error(er.message);
        }
    }

}