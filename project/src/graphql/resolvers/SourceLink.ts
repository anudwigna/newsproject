import { Resolver, Query, Mutation, Arg, Ctx, Authorized, InputType } from "type-graphql";
import { getConnection, Not, Repository } from "typeorm";
import { TokenUtility } from "../../Utilities/TokenUtility";
import { SourceLink } from "../../entity/SourceLink";

@Resolver(SourceLink)
export class SourceLinkResolver{
    
    private _sourceLinkRepository: Repository<SourceLink>;

    constructor(){
        this._sourceLinkRepository = getConnection().getRepository(SourceLink);
    }

    @Query(returns => [SourceLink])
    @Authorized("Admin")
    async sourceLinks(){
        return await this._sourceLinkRepository.find();
    }
}