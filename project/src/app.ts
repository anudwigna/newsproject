import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-express';
import AuthRoute from './routes/auth';
import path from 'path';
import { buildSchema } from 'type-graphql';
import { TagResolver } from './graphql/resolvers/Tag';
import { customAuthChecker } from './graphql/auth/AuthChecker';
import { CategoryResolver } from './graphql/resolvers/Category';
import { PhotoResolver } from './graphql/resolvers/Photo';
import { SourceLinkResolver } from './graphql/resolvers/SourceLink';
import { NewsResolver } from './graphql/resolvers/News';
import { GeneralUserResolver } from './graphql/resolvers/GeneralUser';


class App {
  public app: Application;
  public authRoute: AuthRoute = new AuthRoute();

  constructor() {
    this.app = express();
    this.setConfig();
    this.authRoute.routes(this.app);
  }

  private async setConfig() {
    //Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use('*', cors());
    this.app.use('/static', express.static(path.join(process.cwd(), 'public')))

    const graphQLSchema = await buildSchema({
      resolvers:[ TagResolver, CategoryResolver, PhotoResolver, SourceLinkResolver, NewsResolver, GeneralUserResolver],
      authChecker: customAuthChecker,
      validate: false
    });

    const server = new ApolloServer({ 
      schema: graphQLSchema,
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        uid: req.headers.uid || ''
      })
    });
    server.applyMiddleware({ app: this.app});
  }

  async constructSchema(){
    
  }
}

export default new App().app;