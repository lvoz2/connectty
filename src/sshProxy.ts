import ssh from "ssh2";
import express from "express";

function update(req: express.Request, res: express.Response) {
	res.send("Update");
}

function input(req: express.Request, res: express.Response) {
	res.send("Input");
}

const sshProxy = {"update": update, "input": input};

export default sshProxy;
