export class GeneralUtility{
    public static decodeBase64Image(dataString: string) : any 
    {
        let matches: any = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let response : any = {};

        if (matches.length !== 3) 
        {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        return response;
    }

    public static validateEmail(emailString: string): boolean{
        const emailToValidate = 'a@a.com';
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegexp.test(emailString);
    }
}