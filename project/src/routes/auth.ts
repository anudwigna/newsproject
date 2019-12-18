import { Request, Response, Application } from 'express';
import UserService from '../repositories/UserService';
import { User } from '../entity/User';
import { GeneralUtility } from '../Utilities/GeneralUtility';
import { GeneralUser } from '../entity/GeneralUser';
import admin from '../Utilities/Firebase';

export default class AuthRoute{
    //private _userService : UserService;

    constructor(){
        //this._userService = new UserService();
    }

    public routes(app : Application): void {          
        
        //Register the user
        app.route('/api/auth/register')
        .post(async (req: Request, res: Response) => {   
            try{
                let userService = new UserService();
                let user : User = req.body; 

                if(!GeneralUtility.validateEmail(user.username))
                    throw new Error(`The username ${user.username} is not a valid email.`);

                let userExists = await userService.checkIfUserExists(user.username);
                if(userExists)
                    throw new Error(`The user with username '${user.username}' is already registered.`);

                user.isActive = true;
                user.email = user.username;
                
                let token = await userService.register(user);       
                res.status(200).send(token);
            }
            catch(ex){
                res.status(400).json({"error": ex.message});
            }
        });  
        
        //User Login
        app.route('/api/auth/login')
        .post(async (req: Request, res: Response) => {   
            try{
                let userService = new UserService();
                let user = req.body; 
                let token = await userService.login(user.username, user.password);
                res.status(200).send(token);
            }
            catch(ex){
                res.json({"error": ex.message});
            }
        });  

        //User Information
        app.route('/api/auth/me')
        .get(async (req: Request, res: Response) => {   
            try{
                if(!req.headers.uid)
                    throw new Error("No UID for User!");
                
                let uid : any = req.headers.uid;

                let userService = new UserService();
                const user: GeneralUser = await userService.getUserByUid(uid);          
                res.json(user);;
            }
            catch(ex){
                res.status(400).json({"error": ex.message});
            }
        });  

        //Update User Info after Login
        app.route('/api/auth/user-update')
        .post(async (req: Request, res: Response) => {   
            try{
                if(!req.headers.uid)
                 throw new Error("No UID for User!");
                
                let uid: any = req.headers.uid;

                var firebaseUser = await admin.auth().getUser(uid);

                if(!firebaseUser)
                    throw new Error("The UID is not valid.")

                if(!req.body)
                    throw new Error("No data to Update!");
                
                const inputUser: GeneralUser = req.body;

                let userService = new UserService();
                const user: GeneralUser = await userService.getUserByUid(uid);
                
                if(!user){
                    inputUser.isActive = true;
                    inputUser.isAnonymous = true;
                    inputUser.isEmailVerified = false;
                    inputUser.uid = uid;
                    const retUser = await userService.updateGeneraluser(inputUser);
                    res.status(200).json(retUser);
                }else{
                    user.displayName = inputUser.displayName
                    user.email = inputUser.email;
                    user.phoneNumber = inputUser.phoneNumber;
                    user.photoUrl = inputUser.photoUrl;
                    user.gender = inputUser.gender;
                    user.dob = inputUser.dob;
                    user.isActive = true;
                    user.isAnonymous = inputUser.isAnonymous;
                    user.isEmailVerified = inputUser.isEmailVerified;
                    user.creationTime = inputUser.creationTime;
                    user.lastSignInTime = inputUser.lastSignInTime;
                    user.deviceId = inputUser.deviceId;
                    user.uid = uid;

                    const retUsery = await userService.updateGeneraluser(user);
                    res.status(200).json(retUsery);
                }
            }
            catch(ex){
                res.json({"error": ex.message});
            }
        });  
    }
}