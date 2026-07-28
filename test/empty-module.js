// Stands in for Node.js builtins that have no browser equivalent (fs, net, tls, …).
// `node-stdlib-browser` mocks those with `null`, but browserify used an empty object and
// dependencies like `forever-agent` read properties off them while loading.
module.exports = {};
