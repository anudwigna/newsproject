import { Resolver, Query, Mutation, Arg, Ctx, Authorized, InputType, Int } from "type-graphql";
import { getConnection, Not, Repository, Like } from "typeorm";
import { TokenUtility } from "../../Utilities/TokenUtility";
import { Photo, PhotoInput } from "../../entity/Photo";
import { GeneralUtility } from "../../Utilities/GeneralUtility";
import { GlobalConfig } from "../../config/GlobalConfig";
import logger from "../../Utilities/Logger";
const fs = require('fs').promises;
import path from 'path';

@Resolver(Photo)
export class PhotoResolver{
    
    private _photoRepository: Repository<Photo>;

    constructor(){
        this._photoRepository = getConnection().getRepository(Photo);
    }

    @Query(returns => [Photo])
    @Authorized("Admin")
    async photos(
        @Arg("filterByDescription", { nullable : true}) filter : string 
    ){
        try{
            if(filter){
                let photoList =  await this._photoRepository.find({description: Like(`%${filter}%`)});
                photoList.forEach((photo) => {
                    photo.fullUrl = `${GlobalConfig.PHOTO_PATH}${photo.name}`;
                });
                return photoList;
            }else{
                let photoList = await this._photoRepository.find({ select : ['id', 'name', 'isActive', 'description']});
                photoList.forEach((photo) => {
                    photo.fullUrl = `${GlobalConfig.PHOTO_PATH}${photo.name}`;
                    //cannot get from path, as it always resolve from the project directories.
                    //I need url to access the image, so it must be used in that way from local .env path.
                    //photo.fullUrl = path.resolve('public', 'images', 'photo.name');
                });
                return photoList; 
            }
        }catch(er){
            throw new Error(er.message);
        }
    }

    @Mutation(returns => Photo)
    @Authorized("Admin")
    async insertPhoto(
            @Arg("photo") photoInput: PhotoInput,
            @Ctx("token") token: string
        ): Promise<Photo>{
            try{
                let imageUploadPath: string = `${process.cwd()}/public/images/`;
                let timestamp = +new Date;

                let imageType = GeneralUtility.decodeBase64Image(photoInput.contentString).type.split('/')[1];

                logger.log('info', `The DATA URL for image is ${photoInput.contentString}`);
                logger.log("info", `The image type to upload is ${imageType}`);
                logger.log("info", `The image upload path is ${imageUploadPath}`);

                let fullImagePath = `${imageUploadPath}${timestamp}.${imageType}`;

                let result: any = {};
                await fs.writeFile(fullImagePath, GeneralUtility.decodeBase64Image(photoInput.contentString).data);

                let photo: Photo = new Photo();
                photo.name = `${timestamp}.${imageType}`;
                photo.description = photoInput.description;
                photo.isActive = true;
                photo.adminName = TokenUtility.getUsernameFromToken(token); 
                result = await this._photoRepository.save(photo);
                result.fullUrl = `${GlobalConfig.PHOTO_PATH}${photo.name}`;
                return result;
            }
            catch(er){
                throw new Error(er.message);
            }
    }

    @Mutation(returns => Photo)
    @Authorized("Admin")
    async deletePhoto(
        @Arg("id", type => Int) photoId: number
    ): Promise<Photo>{
        try{
            let dbContext = getConnection().getRepository(Photo);
            let imageUploadPath: string = `${process.cwd()}/public/images/`;
            if(photoId === 0 || photoId === null)
                throw new Error("The photo object is not valid!");
            let theExistingPhoto: Photo = await dbContext.findOne({ id: photoId});
            if(!theExistingPhoto){
                throw new Error("The photo with the supplied Id does not exists!");
            }

            let retPhoto : Photo =  await dbContext.remove(theExistingPhoto);
            if(retPhoto){
                let fileToDeleteExists = fs.stat(`${imageUploadPath}\\${retPhoto.name}`);
                if(fileToDeleteExists){
                    await fs.unlink(`${imageUploadPath}\\${retPhoto.name}`)
                }
            }
            return retPhoto;
        }
        catch(er){
            throw new Error(er.message);
        }

    }
}