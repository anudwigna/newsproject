import { Resolver, Query, Mutation, Arg, Ctx, Authorized, InputType, Int } from "type-graphql";
import { getConnection, Not, Repository, In, getRepository } from "typeorm";
import { TokenUtility } from "../../Utilities/TokenUtility";
import { News, NewsInput } from "../../entity/News";
import { SourceLink } from "../../entity/SourceLink";
import { Category } from "../../entity/Category";
import { Tag } from "../../entity/Tag";
import { GlobalConfig } from "../../config/GlobalConfig";
import axios from "axios";
import logger from "../../Utilities/Logger";

@Resolver(News)
export class NewsResolver{
    
    private _newsRepository : Repository<News>;
    private _sourceLinkRepository: Repository<SourceLink>;
    private _newsLimit: number;

    constructor(){
      this._newsRepository = getConnection().getRepository(News);
      this._sourceLinkRepository = getConnection().getRepository(SourceLink);
      this._newsLimit = GlobalConfig.NEWS_LIMIT
    }

    adjustNewsPhotoUrl(newsList: News[]): News[]{
      newsList.forEach(function(item){
        if(item.photo){
          item.photo.fullUrl = `${GlobalConfig.PHOTO_PATH}${item.photo.name}`;
        }
      })
      return newsList;
    }

    @Query(returns => [News])
    @Authorized("GeneralUser")
    async news(){
        let newsList =  await this._newsRepository.find({ take: this._newsLimit, order:{publishedDate: 'DESC'}});
        
        logger.log("info", "News List Pulled");
        
        return this.adjustNewsPhotoUrl(newsList);
    }

    @Query(returns => [News])
    @Authorized("Admin")
    async newsForAdmin(){
        let newsList =  await this._newsRepository.find({ order:{id: 'DESC'}});
        return this.adjustNewsPhotoUrl(newsList);
    }

    @Authorized("GeneralUser")
    @Query(returns => [News])
    async newsByUserPreference(
      @Ctx("uid") uid: string
      ): Promise<News[]>{
        let newsList = await getRepository(News)
          .createQueryBuilder("news")
          .innerJoinAndSelect("news.categories", "c")
          .innerJoinAndSelect("news.tags", "t")
          .innerJoinAndSelect("news.sourceLinks", "sl")
          .innerJoinAndSelect("news.photo", "p")
          .where(`c.id IN (select guc."categoryId" from "generalUserCategory" AS guc where guc."generalUserUID" = '${uid}')`)
          .andWhere("news.isActive = true")
          .orderBy("news.publishedDate", "DESC")
          .take(this._newsLimit)
          .getMany();
          return this.adjustNewsPhotoUrl(newsList);
    }

    @Authorized("GeneralUser")
    @Query(returns => [News])
    async newsByTopic(
      @Arg("topicId", type => Int) topicId: number,
      @Ctx("uid") uid: string
      ): Promise<News[]>{
        let newsList = await getRepository(News)
          .createQueryBuilder("news")
          .innerJoinAndSelect("news.categories", "c")
          .innerJoinAndSelect("news.tags", "t")
          .innerJoinAndSelect("news.sourceLinks", "sl")
          .innerJoinAndSelect("news.photo", "p")
          .where("t.id = :topicId AND news.isActive = true", {topicId: topicId})
          .orderBy("news.publishedDate", "DESC")
          .getMany();
          return this.adjustNewsPhotoUrl(newsList);
    }

    @Authorized("GeneralUser")
    @Query(returns => [News])
    async newsByCategory(
      @Arg("categoryId", type => Int) categoryId: number,
      @Ctx("uid") uid: string
      ): Promise<News[]>{
        let newsList = await getRepository(News)
          .createQueryBuilder("news")
          .innerJoinAndSelect("news.categories", "c")
          .innerJoinAndSelect("news.tags", "t")
          .innerJoinAndSelect("news.sourceLinks", "sl")
          .innerJoinAndSelect("news.photo", "p")
          .where("c.id = :categoryId AND news.isActive = true", {categoryId: categoryId})
          .orderBy("news.publishedDate", "DESC")
          .getMany();
          return this.adjustNewsPhotoUrl(newsList);
    }

    @Mutation(returns => News)
    @Authorized("Admin")
    async insertNews(
            @Arg("news") newsInput: NewsInput,
            @Ctx("token") token: string
        ): Promise<News>{
            try{
                let newsCount = await this._newsRepository.count({ title: newsInput.title});
                
                if(newsCount > 0){
                  throw new Error("The News with this title already exists!");
                }

                if(!newsInput.categories){
                  throw new Error("At least one category must be assigned to the news!");
                }
    
                if(!newsInput.tags){
                  throw new Error("At least one tag must be assigned to the news!");
                }
    
                if(!newsInput.sourceLinks){
                  throw new Error('At least one source link must be assigned to the news!');
                }

                if(!newsInput.photo){
                  throw new Error('No Photo Associated with the news!');
                }
                
                let news: News = new News();
                news.tags = [];
                news.categories = [];
                news.title = newsInput.title.trim();
                news.content = newsInput.content.trim();
                news.publishedDateBS = newsInput.publishedDateBS.trim();
                news.publishedDate = newsInput.publishedDate;
                news.isPublished = true;
                news.isActive = true;
                news.adminName = TokenUtility.getUsernameFromToken(token);
                newsInput.tags.forEach(function(theTag){
                    let tag: Tag = new Tag();
                    tag.id = theTag.id;
                    tag.name = theTag.name;
                    tag.alias = theTag.alias;
                    news.tags.push(tag);
                });
                newsInput.categories.forEach(function(theCat){
                    let cat: Category = new Category();
                    cat.id = theCat.id;
                    cat.name = theCat.name;
                    cat.alias = theCat.alias;
                    news.categories.push(cat);
                });
                news.photo = newsInput.photo;
                let result = await this._newsRepository.save(news);
    
                if(result){
                  //sending notification

                  let data: any = {
                    "notification": {
                      "title": result.title,
                      "body": result.content,
                      "subtitle": result.publishedDateBS,
                      "icon": "only for android",
                      "sound": "default",
                      "image": `${GlobalConfig.PHOTO_PATH}${result.photo.name}`,
                      "badge": "5",
                      "android_channel_id": "test",
                      "color": "#FF0000",
                      "tag": ""
                    },
                    "time_to_live": 345600,
                    "collapse_key": "",
                    "priority": "high",
                    "data": {
                      "click_action": "FLUTTER_NOTIFICATION_CLICK",
                      "news_id": result.id,
                      "feed_title": "Latest News"
                    },
                    "fcm_options": {
                      "analytics_label": "newsproject"
                    },
                    "to": "/topics/all"
                  }

                  const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': '${GlobalConfig.SERVER_KEY}'
                  }
                  var response = await axios.post("https://fcm.googleapis.com/fcm/send", data, { headers: headers });

                  newsInput.sourceLinks.forEach(async theLInk => {
                    let link: SourceLink = new SourceLink();
                    link.title = theLInk.title.trim();
                    link.url = theLInk.url.trim();
                    link.isActive = true;
                    link.isPrimary = theLInk.isPrimary;
                    link.adminName = TokenUtility.getUsernameFromToken(token);
                    link.news = result;
                    await this._sourceLinkRepository.save(link);
                  });
                }else{
                  await this._newsRepository.delete(result);
                  throw new Error("Cannot Insert the news at this time.");
                }

                return result;
              }
              catch(er){
                throw new Error(er.message);
              }
    }
}