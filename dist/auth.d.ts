import "dotenv/config";
declare function isUniqueUsername(username: string): Promise<number>;
declare function createUser(username: string, password: string): Promise<string[]>;
declare function validateCredentials(username: string, password: string): Promise<string[]>;
declare const auth: {
    createUser: typeof createUser;
    validateCredentials: typeof validateCredentials;
    isUniqueUsername: typeof isUniqueUsername;
    session: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export default auth;
