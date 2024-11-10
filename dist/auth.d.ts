import "dotenv/config";
import express from "express";
interface RequiredEndpointAuth {
    none: string[];
    [key: string]: string[];
}
export declare function createAuthRoute(cookieOptions: express.CookieOptions): (req: express.Request, res: express.Response) => Promise<void>;
export declare function createRegisterRoute(cookieOptions: express.CookieOptions): (req: express.Request, res: express.Response) => Promise<void>;
export declare function createCheckAuthMiddleware(endpoints: RequiredEndpointAuth): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
declare const _default: {
    createAuthRoute: typeof createAuthRoute;
    createCheckAuthMiddleware: typeof createCheckAuthMiddleware;
    createRegisterRoute: typeof createRegisterRoute;
};
export default _default;
