// jscs:disable
/* jshint ignore:start */

module.exports = {
    collectionV2: require('../../examples/collection-v2.json'),
    nestedCollectionV2: require('../../examples/nested-v2-collection.json'),

    rawUrls: [
        // If adding to this list, add to the END, or you'll break a lot of tests which
        // use indexes to access particular URLs.
        'https://user:pass@postman-echo.com/get/?a=1&b=2#heading',
        'http://google.com/',
        'https://postman-echo.com:9090/',
        'postman-echo.com/something/somethingelse#yo',
        'http://postman.tech/?a=b&b={{c}}#{{fragment}}',
        '{{url}}/awesomestuff/endpoint?a=1&b=ghj',
        '{{url}}/somepath/{{alpha}}/{{version}}?yo={{awesome}}&gg=wp#{{fragment}}',
        'someone@postman.xyz/asdasd',
        'HTTP://Example.com:80/Resource?id=123', // This is intentionally having caps.
        {
            protocol: 'http',
            host: 'postman-echo.com',
            port: '80',
            path: '/:resource',
            query: [{ key: 'id', value: '123' }],
            variable: [
                {
                    id: 'resource',
                    value: 'post'
                }
            ]
        },
        {
            protocol: 'http',
            host: 'postman-echo.com',
            port: '80',
            path: '/:method',
            variable: [
                {
                    id: 'method',
                    value: 'get'
                }
            ]
        },
        {
            protocol: 'http',
            host: 'postman-echo.com',
            port: '80',
            path: '/:method',
            variable: [
                {
                    id: 'method',
                    value: 'get'
                }
            ]
        }
    ],
    rawQueryStrings: [
        'asdf=abab&yo=true&akshay={{something}}&something=bald',
        'this={{ensures}}&{{multiple}}replacements=work-{{fine}}&one=1&two=2'
    ],
    queryParams: [
        {
            key: 'hello',
            value: 'what up'
        },
        {
            key: 'omg',
            value: 'thisisawesome'
        }
    ],
    authRequests: {
        basic: {
            auth: {
                type: 'basic',
                basic: {
                    username: 'abhijit',
                    password: 'kane',
                    showPassword: false
                }
            },
            url: 'httpbin.org/get',
            method: 'GET',
            header: [],
            data: {
                mode: 'formdata',
                content: []
            },
            description: ''
        },
        digest: {
            url: 'https://postman-echo.com/digest-auth',
            method: 'GET',
            header: [],
            data: {
                mode: 'formdata',
                content: []
            },
            auth: {
                type: 'digest',
                digest: {
                    username: 'postman',
                    realm: 'Users',
                    password: 'password',
                    nonce: 'bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp',
                    nonceCount: '',
                    algorithm: 'MD5',
                    qop: '',
                    clientNonce: '',
                    opaque: ''
                }
            }
        },
        digestWithQueryParams: {
            url: 'https://postman-echo.com/digest-auth?key=value',
            method: 'GET',
            header: [],
            data: {
                mode: 'formdata',
                content: []
            },
            auth: {
                type: 'digest',
                digest: {
                    username: 'postman',
                    realm: 'Users',
                    password: 'password',
                    nonce: 'bcgEc5RPU1ANglyT2I0ShU0oxqPB5jXp',
                    nonceCount: '',
                    algorithm: 'MD5',
                    qop: '',
                    clientNonce: '',
                    opaque: ''
                }
            }
        },
        oauth1: {
            auth: {
                type: 'oauth1',
                oauth1: {
                    consumerKey: 'RKCGzna7bv9YD57c',
                    consumerSecret: 'D+EdQ-gs$-%@2Nu7',
                    token: '',
                    tokenSecret: '',
                    signatureMethod: 'HMAC-SHA1',
                    timestamp: '1453890475',
                    nonce: 'yly1UR',
                    version: '1.0',
                    realm: 'oauthrealm',
                    addParamsToHeader: true,
                    autoAddParam: true,
                    addEmptyParamsToSign: false
                }
            },
            url: 'https://postman-echo.com/oauth1?hi=hello&yo=true',
            method: 'POST',
            header: [
                {
                    key: 'Authorization',
                    value: 'OAuth oauth_consumer_key="RKCGzna7bv9YD57c",oauth_signature_method="HMAC-SHA1",' +
                             'oauth_timestamp="1453890449",oauth_nonce="aT8kIM",oauth_version="1.0",' +
                             'oauth_signature="Ng8eD0bKh6LO5V0A9O6Z%2BY6D0tU%3D"',
                    description: ''
                }
            ],
            data: {
                mode: 'urlencoded',
                content: [{
                    key: 'haha',
                    value: 'somevalue'
                }]
            }
        },
        oauth2: {
            auth: {
                type: 'oauth2',
                oauth2: {
                    addTokenTo: 'RKCGzna7bv9YD57c',
                    callBackUrl: 'D+EdQ-gs$-%@2Nu7',
                    authUrl: '',
                    accessTokenUrl: '',
                    clientId: 'HMAC-SHA1',
                    clientSecret: '1453890475',
                    scope: 'yly1UR',
                    requestAccessTokenLocally: '1.0'
                }
            },
            url: 'https://postman-echo.com/oauth2?hi=hello&yo=true',
            method: 'POST',
            data: {
                mode: 'urlencoded',
                content: [{
                    key: 'haha',
                    value: 'somevalue'
                }]
            }
        },
        awsv4: {
            auth: {
                type: 'awsv4',
                awsv4: {
                    id: 'awsSigV4',
                    time: 1452673288848,
                    // Fake Credentials
                    accessKey: 'AKIAI53QRL',
                    secretKey: 'cr2RAfsY4IIVweutTBoBzR',
                    sessionToken: '33Dhtnwf0RVHCFttmMPYt3dxx9zi8I07CBwTXaqupHQ=',
                    region: 'eu-west-1',
                    service: '',
                    auto: true,
                    saveHelper: true,
                    serviceName: 'execute-api'
                }
            },
            url: 'https://the2yl2ege.execute-api.eu-west-1.amazonaws.com/{{stagename}}/item',
            method: 'POST',
            header: [
                {
                    key: 'content-type',
                    value: 'application/json',
                    description: ''
                },
                {
                    key: 'X-Amz-Date',
                    value: '20160128T095051Z',
                    description: ''
                }
            ],
            data: {
                mode: 'raw',
                content: '{\'what\': \'isthis\'}'
            },
            description: ''
        },
        hawk: {
            auth: {
                type: 'hawk',
                hawk: {
                    authId: 'dh37fgj492je',
                    authKey: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
                    algorithm: 'sha256',
                    user: 'asda',
                    saveHelperData: true,
                    extraData: 'skjdfklsjhdflkjhsdf',
                    appId: '',
                    delegation: ''
                }
            },
            url: 'http://postman-echo.com/auth/hawk',
            method: 'GET',
            header: [
                {
                    key: 'Authorization',
                    // eslint-disable-next-line max-len
                    value: 'Hawk id="dh37fgj492je", ts="1448888081", nonce="HoH6Ay", ext="skjdfklsjhdflkjhsdf", mac="moWleO5f/8QbvIiy7oo2zj1bmezhrYwrCkz4BsXg0M4="',
                    description: ''
                }
            ],
            body: {
                mode: 'formdata',
                formdata: []
            },
            description: ''
        }
    },
    rawCookie: 'GAPS=lol;Path=/;Expires=Sun, 04-Feb-2018 14:18:27 GMT;Secure;HttpOnly;Priority=HIGH',
    requestData: {
        mode: 'formdata',
        formdata: [
            {
                key: 'hiya',
                value: 'heyo'
            },
            {
                key: 'alpha',
                value: 'beta'
            }
        ],
        raw: 'abhijitkane',
        urlencoded: [
            {
                key: 'haha',
                value: 'somevalue'
            }
        ]
    },
    responseData1: {
        code: 200,
        body: '{"status":200}',
        // eslint-disable-next-line max-len
        header: 'HTTP/1.1 200 OK\r\nServer: nginx/1.8.1\r\nDate: Sun, 24 Jul 2016 23:16:35 GMT\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 14\r\nConnection: keep-alive\r\nAccess-Control-Allow-Origin: \r\nAccess-Control-Allow-Credentials: \r\nAccess-Control-Allow-Methods: \r\nAccess-Control-Allow-Headers: \r\nAccess-Control-Expose-Headers: \r\nETag: W/"e-+3Pmmp/QERKiJq3DueGVYg"\r\nVary: Accept-Encoding\r\nset-cookie: sails.sid=s%3A5KvXh2N_L9GM7L-ZMtv7TCNbiVmNbH2_.aL8xAy5OL9F9vXEhJEIj5%2Br0bdcrpUPGUX4mB7gZ67o; Path=/; HttpOnly\r\n\r\n'
    },
    responseData2: {
        code: 200,
        body: '{"status":200}',
        // eslint-disable-next-line max-len
        header: 'HTTP/1.1 200 OK\nServer: nginx/1.8.1\nDate: Sun, 24 Jul 2016 23:16:35 GMT\nContent-Type: application/json; charset=utf-8\nContent-Length: 14\nConnection: keep-alive\nAccess-Control-Allow-Origin: \nAccess-Control-Allow-Credentials: \nAccess-Control-Allow-Methods: \nAccess-Control-Allow-Headers: \nAccess-Control-Expose-Headers: \nETag: W/"e-+3Pmmp/QERKiJq3DueGVYg"\nVary: Accept-Encoding\nset-cookie: sails.sid=s%3A5KvXh2N_L9GM7L-ZMtv7TCNbiVmNbH2_.aL8xAy5OL9F9vXEhJEIj5%2Br0bdcrpUPGUX4mB7gZ67o; Path=/; HttpOnly'
    }
};

/* jshint ignore:end */
