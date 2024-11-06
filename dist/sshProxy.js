function update(req, res) {
  res.send("Update");
}
function input(req, res) {
  res.send("Input");
}
var sshProxy = {
  "update": update,
  "input": input
};
export default sshProxy;