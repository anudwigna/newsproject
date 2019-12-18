import { AuthChecker } from "type-graphql";
import UserService from "../../repositories/UserService";
import { AuthenticationError } from "apollo-server-express";
import { getConnection } from "typeorm";
import { GeneralUser } from "../../entity/GeneralUser";

export const customAuthChecker: AuthChecker = async (
    { root, args, context, info },
    roles,
  ) => {
    let role: string = "";
    let theContext : any = context;
    try{
        role = roles[0].toLowerCase();
    }catch(ex){
        throw new AuthenticationError("You are not Authorized to access the resource.");
    }

    //checking roles for general user
    if(role === "generaluser"){
        try{
            if(theContext.uid){
                const uid : string = theContext.uid;
                const generalUser: GeneralUser = await getConnection().getRepository(GeneralUser).findOne({ uid: uid});
                if(!generalUser)
                    throw new AuthenticationError("You are not yet registered in the system.");
            }else{
                throw new AuthenticationError("You are not Authorized to access this resource.");
            }
            return true;
        }catch(ex){
            throw new AuthenticationError(ex.message);
        }
    }

    //checking roles for admin user
    if(role === "admin"){
        try{
            if(theContext.token){
                const token = theContext.token.split(' ')[1];
                const user = await new UserService().getUserByToken(token);
                if(!user)
                    throw new AuthenticationError("The token is not valid.");
                else{
                    if(!new UserService().checkAdminRole(token))
                        throw new AuthenticationError("You do not have sufficient privileges to access this resource.");
                }
            }else{
                throw new AuthenticationError("No Token issued to access this resource!");
            }
            return true;
        }catch(ex){
            throw new AuthenticationError(ex.message);
        }
    }
  };