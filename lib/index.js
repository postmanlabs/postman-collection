module.exports = {
    /** @type {PropertyBase} */
    PropertyBase: require('./collection/property-base').PropertyBase,

    /** @type {Certificate} */
    Certificate: require('./collection/certificate').Certificate,

    /** @type {CertificateList} */
    CertificateList: require('./collection/certificate-list').CertificateList,

    /** @type {Collection} */
    Collection: require('./collection/collection').Collection,

    /** @type {Cookie} */
    Cookie: require('./collection/cookie').Cookie,

    /** @type {CookieList} */
    CookieList: require('./collection/cookie-list').CookieList,

    /** @type {Description} */
    Description: require('./collection/description').Description,

    /** @type {Event} */
    Event: require('./collection/event').Event,

    /** @type {EventList} */
    EventList: require('./collection/event-list').EventList,

    /** @type {FormParam} */
    FormParam: require('./collection/form-param').FormParam,

    /** @type {Header} */
    Header: require('./collection/header').Header,

    /** @type {HeaderList} */
    HeaderList: require('./collection/header-list').HeaderList,

    /** @type {Item} */
    Item: require('./collection/item').Item,

    /** @type {ItemGroup} */
    ItemGroup: require('./collection/item-group').ItemGroup,

    /** @type {MutationTracker} */
    MutationTracker: require('./collection/mutation-tracker').MutationTracker,

    /** @type {PropertyList} */
    PropertyList: require('./collection/property-list').PropertyList,

    /** @type {Property} */
    Property: require('./collection/property').Property,

    /** @type {QueryParam} */
    QueryParam: require('./collection/query-param').QueryParam,

    /** @type {Request} */
    Request: require('./collection/request').Request,

    /** @type {RequestAuth} */
    RequestAuth: require('./collection/request-auth').RequestAuth,

    /** @type {RequestBody} */
    RequestBody: require('./collection/request-body').RequestBody,

    /** @type {Response} */
    Response: require('./collection/response').Response,

    /** @type {Script} */
    Script: require('./collection/script').Script,

    /** @type {Url} */
    Url: require('./collection/url').Url,

    /** @type {UrlMatchPattern} */
    UrlMatchPattern: require('./url-pattern/url-match-pattern').UrlMatchPattern,

    /** @type {UrlMatchPatternList} */
    UrlMatchPatternList: require('./url-pattern/url-match-pattern-list').UrlMatchPatternList,

    /** @type {Variable} */
    Variable: require('./collection/variable').Variable,

    /** @type {VariableList} */
    VariableList: require('./collection/variable-list').VariableList,

    /** @type {VariableScope} */
    VariableScope: require('./collection/variable-scope').VariableScope,

    /** @type {ProxyConfig} */
    ProxyConfig: require('./collection/proxy-config').ProxyConfig,

    /** @type {ProxyConfigList} */
    ProxyConfigList: require('./collection/proxy-config-list').ProxyConfigList,

    /** @type {Version} */
    Version: require('./collection/version').Version
};
