import dotenv from 'dotenv';
dotenv.config();


//Getting Data from .env file

export class GlobalConfig{
  static JWT_SECRET : string = process.env.JWT_SECRET;
  static PHOTO_PATH: string = process.env.PHOTO_PATH;
  static CATEGORY_PHOTO_PATH: string = process.env.CATEGORY_PHOTO_PATH;
  static NEWS_LIMIT: number = parseInt(process.env.NEWS_LIMIT);
  static SERVER_KEY: string = process.env.SERVER_KEY;
}
