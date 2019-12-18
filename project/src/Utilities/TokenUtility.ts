import jsonwebtoken from "jsonwebtoken";

export class TokenUtility{
    public static getUsernameFromToken(token: string){
        let decoded : any = jsonwebtoken.decode(token.split(' ')[1]);
        return decoded.username;
    }
}