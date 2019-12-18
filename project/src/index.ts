import "reflect-metadata";
import {createConnection, ConnectionOptions, getConnection} from "typeorm";
import app from "./app";
import { Request, Response } from 'express';

createConnection().then(async connection => {
    console.log("Connection Created!");
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
}).catch(error => console.log(error));

app.get('/', async (req : Request, res : Response) => {
    //let userService = new UserService();
    //res.json(await userService.getAllUsers());
    res.send("Welcome to News Project!");
});
