import ssh from "ssh2";

function update(req, res) {
	res.send("Update");
}

function input(req, res) {
	res.send("Input");
}

const sshProxy = {"update": update, "input": input};

export default sshProxy;
