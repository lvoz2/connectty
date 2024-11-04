import express from "express";
declare function update(req: express.Request, res: express.Response): void;
declare function input(req: express.Request, res: express.Response): void;
declare const sshProxy: {
    update: typeof update;
    input: typeof input;
};
export default sshProxy;
