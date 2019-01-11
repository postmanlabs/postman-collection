var SSHTunnell = require('./ssh-tunnell').SSHTunnell,
    SSHConfig = require('./ssh-config').SSHConfig,
    SSHAuth = require('./ssh-auth').SSHAuth,
    tunnell = new SSHTunnell(),

    config = new SSHConfig({
        forwardPort: 3128,
        auth: new SSHAuth({
            host: '54.173.108.141',
            port: 22,
            username: 'ubuntu',
            privateKeyPath: '/Users/ankitsingh/Documents/devPlayground/ssh/key_rsa'
        })
    });

// console.log(config.auth.privateKeyPath);

tunnell.start(config, 8000, function (err) {
    if (err) {
        // throw err;
        console.log('somthing is wrong');
    }
    // eslint-disable-next-line no-console
    console.log('SSH tunnell established succesfully');
});

setTimeout(function () {
    tunnell.close(function (err, status) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Status : ' + status);
    });
}, 6000);

