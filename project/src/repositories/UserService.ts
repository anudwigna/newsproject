import {User} from '../entity/User'
import { getConnection, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { GlobalConfig } from '../config/GlobalConfig';
import { AuthenticationError } from 'apollo-server-core';
import { GeneralUser } from '../entity/GeneralUser';

export default class UserService{
    private _userRepository : Repository<User>;
    private _generalUserRepository: Repository<GeneralUser>;

    constructor(){
        this._userRepository = getConnection().getRepository(User);
        this._generalUserRepository = getConnection().getRepository(GeneralUser);
    }

    public async getAllUsers() : Promise<User[]> {
        let users = await this._userRepository.find();
        return users;
    }

    private getToken(theUsername) : {} {
        const token = jsonwebtoken.sign(
            { username: theUsername, roles: "ADMIN" },
            GlobalConfig.JWT_SECRET,
            { expiresIn: '1d' }
          );
        return {"token": token};
    }

    public async register(user: User): Promise<any>{
        try{
            user.password = await bcrypt.hash(user.password, 10);
            let retUser = await this._userRepository.save(user);
            if(retUser){
                return this.getToken(retUser.username);
            }
        }catch(ex){
            throw new Error(ex.message);
        }
    }

    public async getByUsername(username: string): Promise<User>{
        try{
            let theUser = await this._userRepository.findOne({username : username});
            if(theUser){
                return theUser;
            }else{
                throw new Error(`This user does not exists.`);
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    public async checkIfUserExists(theUsername: string) : Promise<Boolean>{
        try{
            let user = await this._userRepository.findOne({ username : theUsername});
            if(user)
                return true;
            else
                return false;
        }catch(ex){
            return false;
        }   
    }

    public async login(username: string, password:string) : Promise<any>{
        try{
            if(username.length === 0)
                throw new Error("Username cannot be empty!");
            
            if(password.length === 0)
                throw new Error("Password cannot be empty!");
            let user = await this.getByUsername(username);
            if(user){
                //console.log(user);
                let isValidPassword = await bcrypt.compare(password, user.password);
                if(isValidPassword){
                    return this.getToken(user.username);
                }else{
                    throw new Error("Invalid Credentials.");
                }
            }else{
                throw new Error(`The Username '${username}' is not registered in the system.`);
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    async getUserByToken(token : string) : Promise<User>{
        try{
            const data : any = jsonwebtoken.verify(token, GlobalConfig.JWT_SECRET);
            const username = data.username;
            return await this.getByUsername(username);
        }
        catch(ex){
            throw new Error("The token is not Valid!");
        }
    }

    checkAdminRole(token: string) : boolean {
        try{
            const data : any = jsonwebtoken.decode(token);
            if(data.roles === "ADMIN")
                return true;
            else
                return false;
        }
        catch(ex){
            throw new Error(ex.message);
        }
    }

    public async update(user: User): Promise<any>{
        try{
            const retUser = await this._userRepository.save(user);
            return retUser;
        }catch(ex){
            throw new Error(ex.message);
        }
    }

    public async updateGeneraluser(user: GeneralUser): Promise<GeneralUser>{
        try{
            const retUser = await this._generalUserRepository.save(user);
            return retUser;
        }catch(ex){
            throw new Error(ex.message);
        }
    }

    async getUserByUid(uid : string) : Promise<GeneralUser>{
        try{
            const user = await this._generalUserRepository.findOne({uid: uid});
            return user;
        }
        catch(ex){
            throw new Error(ex.message);
        }
    }
}

