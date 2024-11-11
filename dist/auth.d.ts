import "dotenv/config";
import express from "express";
interface RequiredEndpointAuth {
    none: string[];
    [key: string]: string[];
}
export declare function createAuthRoute(cookieOptions: express.CookieOptions): (req: express.Request, res: express.Response) => Promise<void>;
export declare function createRegisterRoute(cookieOptions: express.CookieOptions): (req: express.Request, res: express.Response) => Promise<void>;
export declare function createRemoveStaleJWTsMiddleware(timeout: number): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
export declare function createCheckAuthMiddleware(endpoints: RequiredEndpointAuth, timeout: number): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
declare const _default: {
    createAuthRoute: typeof createAuthRoute;
    createCheckAuthMiddleware: typeof createCheckAuthMiddleware;
    createRegisterRoute: typeof createRegisterRoute;
    createRemoveStaleJWTsMiddleware: typeof createRemoveStaleJWTsMiddleware;
};
export default _default;
