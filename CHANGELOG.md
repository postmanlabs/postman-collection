# Postman Collection SDK Changelog

#### v3.2.0 (August 20, 2018)
* #694 Updated dependencies :arrow_up:
* #689 Added support for `contentType` to form data request bodies.
* #679 Fixed URL path handling :bug:
* #681 Fixed a bug that caused URL parsing to ignore path variables :bug:

### v3.1.1 (June 30, 2018)
* Fixed: Remove `console` statement, which may not be available in some environments
* Fixed: Added `info` to `Property~Definition` documentation
* Added support for `Response.prototype.jsonp()` to easily extract `jsonp` inside sandbox
* Updated dependencies

### v3.1.0 (June 28, 2018)
* Added support for tracking changes on a `VariableScope`. To use this enable tracking on your variable scope

```js
var variableScope = new VariableScope();

variableScope.enableTracking();
```

* If you are only interested in the last change for any key, you can use the `autoCompact` option.

```js
var variableScope = new VariableScope();

variableScope.enableTracking({ autoCompact: true });
```

* This makes sure that you are only provided with the most minimal set of changes. Use this when you want to optimize memory usage or improve performance when applying the changes back.

* The `mutations` object allows you to then apply the same changes on a different `VariableScope`.

```js
var scope1 = new VariableScope(),
   scope2 = new VariableScope();

// enable tracking
scope1.enableTracking();

// this change is captured in scope1.changes
scope1.set('foo', 'bar');

// this applies the captured changes on scope2
scope1.mutations.applyOn(scope2);
```
* Added `MutationTracker` for tracking mutations.
* Fixed documentation for `Description~definition`
* Added `Response~contentInfo` to extract mime info and filename from response.
* Deprecated `Response~mime` and `Response~mimeInfo`
* Updated dependencies

#### v3.0.10 (May 22, 2018)
* Revert computing filename from content-disposition header in `Response~mime`
* Updated dependencies

#### v3.0.9 (May 16, 2018)
* Faster `QueryParam~unparse`
* `Variable~toString` now stringifies falsy values instead of falling back to empty string
* `Response~mimeInfo` now computes filename from `content-disposition` header
* Updated dependencies

#### v3.0.8 (March 21, 2018)
* :arrow_up: Updated dependencies
* :bug: Improved type checking in `RequestBody~update` #607
* :bug: Fixed bug that caused missing descriptions in `Collection~toJSON` #589

#### v3.0.7 (January 15, 2018)
* :arrow_up: Updated dependencies
* :bug: Improved pre-stringification variable type safety #539

#### v3.0.6 (November 30, 2017)
* :arrow_up: Updated dependencies
* Downgraded `sanitize-html` to continue support for `postman-sandbox`

#### v3.0.5 (November 23, 2017)
* Added `update` method to `Script`
* :arrow_up: Updated dependencies

#### v3.0.4 (November 20, 2017)
* :tada: Get and set objects in variables with `json` variable type
```js
var variable = new Variable({ type: 'json' });

// set objects as values for `json types`
variable.set({ version: 'v1' });

// get object values
console.log(variable.get()); // { version: 'v1' }
console.log(typeof variable.get()); // object
```
* #502 Added support for system property in query parameters
* #503 `request~toJSON` no longer converts `url` to string
* Made sure all Script instances have an id
* :bug: Fixed a bug where updating types in a variable removed value functions
* :bug: `auth` is now included in `collection.toJSON`
* :bug: Fixed a bug where `item.getAuth` would return an empty `RequestAuth`, instead of looking up in the parent
* :bug: Fixed a bug where empty `auth` was created for `new {Request,ItemGroup,Collection}({auth: null})`. This affected the auth lookup in parents.

#### v3.0.3 (November 8, 2017)
* :arrow_up: Updated dependencies.
* #501 Fixed `Description~toString()` behaviour for falsy description contents. :bug:
* #499 Updated `.npmignore`

#### v3.0.2 (November 6, 2017)
* Updated dependencies. :arrow_up:
* #495 Added Node v8 to the CI.
* #494 Allowed `VariableScope~toObjectResolved` to be called with parent overrides. :tada:
* #484 Switched to [8fold-marked](https://www.npmjs.com/package/8fold-marked) from [marked](https://www.npmjs.com/package/marked) :closed_lock_with_key:
* #485 Fixed `VariableScope~toObject` to respect layers :bug:

#### v3.0.1 (October 12, 2017)
* :arrow_up: Updated dependencies
* :bug: Corrected file URL handling #479

#### v3.0.0 (September 26, 2017)
* :arrow_up: Updated to using collection format schema v2.1 (auth structure change)
* Modified functioning of `Item#getAuth` to return `RequestAuth` directly
* :tada: Added sugar to RequestAuth to handle any auth type (refer docs)
* :fire: Removed any auth type specific code from SDK. All individual authentication related code is now moved to `postman-runtime`
* :tada: Added ability to deal with `PropertyList~upsert` operations
* :fire: Removed `.sign()` from Request Auth
* Made `Request.toJSON` use `PropertyBase` toJSON
* :tada: Updated `.toObjectResolved` to accept reference tree for resolution of variables
* :tada: Updated variable substitution function to now look up the parent tree to find variable replacement

#### v2.1.3 (August 28, 2017)
* :bug: Added an option to ignore disabled parameters in `QueryParam.unparse` #429
* :bug: Ensured that all `_.get` calls use valid and sane fallback values. #444
* :bug: Ensured that empty hosts don't cause an exception in `Url~getHost`. #443

#### v2.1.2 (August 21, 2017)
* Renamed the property `_postman_requiresId` to `_postman_propertyRequiresId` in order to be standard compliant #441

#### v2.1.1 (August 18, 2017)
* :tada: Added an option to sanitize Property keys in `PropertList~toObject` #430
* :bug: Fixed a bug that caused incorrect AWS Auth signatures #438
* :racehorse: Initialized `VariableScope~_layers` only on demand, and not by default #437
* Updated dependencies, added edge case unit tests.

#### v2.1.0 (July 18, 2017)
* Updated `ProxyConfig#getProxyURL` to always return proxy URL with HTTP protocol #417
* Prevented `_details` from showing up in `Response#toJSON` results #411
* The `Script` constructor now accepts script arrays and strings as well #404
* `VariableScope#toObject` now returns data across multiple layers as well #384

#### v2.0.2 (July 5, 2017)
* :bug: Fixed typo in the `ALLOWED_PROTOCOLS` variable #403

#### v2.0.1 (July 3, 2017)
* Updated `ProxyConfig` to match all protocols, hosts and paths by default. #402

#### v2.0.0 (July 3, 2017)
* **Breaking Change:**  Updated the `ProxyConfig` & `UrlMatchPattern` to support multiple protocols.
* `ProxyConfig` and `ProxyConfigList` now accept the `host` and `port` keys instead of `server`. The `match` property also takes in multiple protocols:
```js
// v1.2.9
var proxyConfig = new ProxyConfig({
    match: 'http://*/foo',
    server: 'https://proxy.com:8080', // This has been split into host and port in v2.0.0
    tunnel: true
});
var proxyConfigList = new ProxyConfigList({}, [
    {
        match: 'http://*/foo',
        server: 'https://proxy.com:8080', // This has been split into host and port in v2.0.0
        tunnel: true
    }
]);

// v2.0.0
var proxyConfig = new ProxyConfig({
    match: 'http+ftp://*/foo', // match now supports multiple plus(`+`) separated protocols
    host: 'proxy.com', // In v1.2.9, `host` and `port` were combined into `server`
    port: 8080,
    tunnel: true
});

var ProxyConfigList = new ProxyConfigList({}, [
    {
        match: 'http+ftp://*/foo', // `match` now supports multiple plus(`+`) separated protocols
        host: 'proxy.com', // In v1.2.9, `host` and `port` were combined into `server`
        port: 8080,
        tunnel: true
    }
]);
```
* `UrlMatchPattern` now returns an array of protocol strings:
```js
// v1.2.9
var matchPattern = new UrlMatchPattern('http://*/*').createMatchPattern();
matchPattern.protocol // 'http'

// v2.0.0
var matchPattern = new UrlMatchPattern('http://*/*').createMatchPattern();
matchPattern.protocols // ['http'] (The singular protocol key has been replaced with the plural protocols in v2.0.0)

var anotherMatchPattern = new UrlMatchPattern('http+https+ftp+file://').createMatchPattern();
anotherMatchPatter.protocols // ['http', 'https', 'ftp', 'file']
```
* `ProxyConfig#server` has been removed in favour of the new host format:
```js
// v1.2.9
var proxyConfigList = new ProxyConfigList({}, [
    {
        match: 'https://*/*',
        host: 'proxy.com'
    }
]);
proxyConfigList.resolve('https://www.google.com').server.getHost(); // `proxy.com`

// v2.0.0
var proxyConfigList = new ProxyConfigList({}, [
    {
        match: 'https://*/*',
        host: 'proxy.com'
    }
]);
proxyConfigList.resolve('https://www.google.com').host // `proxy.com`
```

#### v1.2.9 (June 27, 2017)
* Added support to allow duplicate indexed items to be exported as array via `PropertyList.prototype.toObject`
* Added a helper, `ItemGroup.oneDeep()` to recursively look for an `Item` in an `ItemGroup`
* Fixed a bug which caused `PropertyList.remove()` to remove uncalled for elements from internal reference

#### v1.2.8 (May 31, 2017)
* Fixed a bug where converting `QueryParam` and `FormParam` lists to objects was not working

#### v1.2.7 (May 30, 2017)
* Fixed path variable data representations to work correctly with `id` as well as `key`.

#### 1.2.6 (May 29, 2017)
* Enhanced `Url.toString()` to handle non-string path variable values
* Enhanced `PropertyList.has()` to also check for values (optionally)
* Added a data structure for NTLM authentication mechanism

#### 1.2.5 (May 11, 2017)
* Added support for multi-layered variable resolution
* Added convenience method, `VariableScope.toObject()`
* `VariableScope.variables()` is now deprecated in favor of above

#### 1.2.4 (May 09, 2017)
* Fixed a bug in the response size computation which was caused due to reliance on a hidden property

#### 1.2.3 (May 08, 2017)
* `Header` now inherits from `Property` instead of `PropertyBase`.
* Authorization helper fixes.
* Descriptions have been shifted to `Property` from `PropertyBase`.
* Header size is sent is zero if no headers are present.

#### 1.2.2 (April 26, 2017)
* Updated signing logic to support inherited auth parameters
* Added a new helper function, `setParent` to `PropertyBase`

#### 1.2.1 (April 25, 2017)
* Improved documentation
* Added a new property, `CookieList`
* Fixed a bug in the `RequestAuth` implementation which caused authorization step to be skipped

#### 1.2.0 (April 24, 2017)
* Added support for variable types via VariableScope `.set` function
* Added `VariableScope~variables` to access all variables as a plain object
* Ensure that `Xyz.isXyz()` functions always return a boolean
* Fixed a bug which caused `Request` to not initialize headers
* Fixed issue with Cookie constructor misbehaving when constructor definition was missing
* Fixed issue with `Cookie~update` function causing previosuly defined properties from being overwritten
* Updated Cookie to behave properly in lists (`name` is now the key and it is multi-value case insensitive)
* `RequestAuthBase` inherits from `PropertyBase`
* All auth definitions inherit from `RequestAuthBase` (through a dynamic intermediate class)
* Added `Item.getAuth()` which returns an instance of the currently selected auth-type (searches parent folders as well)
* Added `PropertyBase.findInParents` which finds a given property in the closest parent.
* Added `PropertyBase.findParentContaining` which finds the closest parent containing the given property.
* Added `RequestAuth.current()` which returns an instance of the currently selected auth.
* Added `.toObject` and `.toString` method to PropertyList to work for Types that has a .valueOf and `.unparse` defined.
* Added HeaderList and **discontinued** `Header.headerValue` in favour of `HeaderList.get`

#### 1.1.0 (April 03, 2017)
* Enhanced the `PropertyList` to allow keys with multiple values
* Removed Response details `fromServer` flag
* Added Response details `standardName` property
* Added `set`, `get`, `unset` and `clear `helpers to `VariableScope`
* Fixed a bug in `PropertyList#clear` which caused only the first property of a list to be removed
* Added `Response#details` helper to retain custom server HTTP reasons
* Fixed a script resolution bug in `Event#update`
* Added `Response.isResponse` and `Script.isScript` helpers
* Added `Request.isRequest` helper

#### 1.0.2 (March 21, 2017)
* Downgraded `file-type` to v3.9.0, which is browserify compatible

#### 1.0.1 (March 14, 2017)
* Added a helper function, `isProxyConfig`

#### 1.0.0 (March 06, 2017)
* Added proxy and certificate properties to request model
* Added UrlMatchPattern, UrlMatchPatternList classes
* Added Certificate and CertificateList classes for certificate information
* Fixed a bug in `PropertyList` which caused members to not be JSONified correctly

#### 0.5.13 (February 24, 2017)
* Added helper functions for traversing parent properties (`.parent()` & `.forEachParent()`)

#### 0.5.12 (February 16, 2017)
* Migrated code from echo.getpostman.com to postman-echo.com
* Allow options.stream to be a new Buffer().toJSON()

#### 0.5.11 (January 31, 2017)
* Ignore dots within variables on host
* Added test for multiple variables with host
* Added more test cases for url parse
* Fixes  'getOAuth1BaseUrl' to not lowercase the url path
* Removed unused quantifier from character class
* Find the encoding from the header and encode the stream response accordingly
* Update response.js
* Improved response documentation structure and added encoding helper function
* Reduced one more toString call :)
* Added the Buffer check instead of checking for ArrayBuffer
* Bail out early if it is a arraybuffer
* Moved the charset handling to mime-format
* Added the charset to the mime info

#### 0.5.10 (December 2016)
* Provided the public api to test the match pattern
* Fixed invalid script reference
* Renamed util lodash pluck to choose
* Returned undefined if the pattern is not a valid one for proxy match pattern
* Provided the public api to test the match pattern
* Respect the disabled prop in the proxyConfigList
* Fixed invalid script reference

#### 0.5.9 (December 19, 2016)
* Fixed post build success documentation publish flow

#### 0.5.8 (December 14, 2016)
* Find the encoding from the header and encode the stream response accordingly
* Replace node-uuid with uuid module since node-uuid has been deprecated
* Fixed the example in the readme file
* Converted `timeStamp` to `timestamp` in oAuth1

#### 0.5.7 (November 16, 2016)
* Fixed inheritance of formparam
* Added the ability to provide the disabled prop to the the form-param
* Set the disabled prop only if it is provided
* Added the ability to provide the disabled prop to the the form-param
* Added response module contructor helper
* Improved validation, added isCookie method + tests
* Skipped cookie tests
* Improved naming, added more tests
* Added response module contructor helper

#### 0.5.6 (November 2, 2016)
* Remove non-existing directories from `package.json`
* Supports ProxyConfig and ProxyConfig List
* Cleanup directory structure in `package.json`
* added a Response.prototype.encoding private function to return encoding of the response.
* Updated Response mime detection functions to use constants to improve performance. + a few doc improvements
* Response objects are now marked to always use and generate IDs
* Updated documentation of Response constructor and made .reason() function use custom reason message
* Proxy Config support
* Added utility function (internal) to select the first non-empty value from a set of values.
* Added the test for default all_url policy to go through all the urls.
* Replaced the .test with .match for better stateless reggae matching
* Removed Node v5 from the build configuration

#### 0.5.5 (October 14, 2016)
* fixed a bug in hawk auth
* Altered build-wiki script for breaking changes
* Unskipped body mime detection test

#### 0.5.4 (October 5, 2016)
* Handle empty session token in aws auth
* If the app sends us an empty session token, do not give it to the library
* Corrected `_.merge` discrepancy
* Replaced deprecated fs.existsSync calls in system tests
* Turned off the unit test cobertura reporter on CI. This would now allow to see full build report on Travis
* Rename 'name' to 'key' to make our cookie compatible with tough cookie

#### 0.5.3 (September 28, 2016)
* AppVeyor + system tests
* Ported scripts to Shelljs (#130)
* Sync scope to object
* Added helper function in collection to expand functionalities of list sync to target object
* Added function in VariableList to sync it's members to an object
* Updated `marked` dependency to 0.3.6 to patch security issue

#### 0.5.2 (September 21, 2016)
* Ensure that AWS Auth *updates* headers if they already exist
* Create/Update header functionality
* Do not remove aws sha256 header
* Ensure that upsertHeader does not blow up if no header is specified
* Renamed functional tests to unit
* Added a helper method to allow updating or inserting a header

#### 0.5.1 (September 20, 2016)
* Renamed functional tests to unit
* Renamed unit tests to integration
* Fixed a crash in request body empty check
* Replaced JSHint + JSCS with ESLint + plugins
* Added support of query params to uri in digest
* Added support of query params to uri in digest

#### 0.5.0 (September 16, 2016)
* Ensure that security token is removed from headers before sending the request
* Oauth1 empty parameters
* AWSv4 session token support
* Fixed context binding operations
* Added leviathan JSON test
* Respect the empty parameter setting
* Updated Lodash to v4
* Added `hawk` to GreenKeeper ignore
* VariableScope object (and other performance improvements)
* Made the VariableScope always clone a list if provided in constructor (reasons stated as inline comment) + added test
* Relaxed the variable list transformation functions check on validity of the object inside an array
* Fixed a bug introduced where variable-list was transforming to wrong property value - `values` instead of `value`
* Added resolution correctness check for slashed variable names
* Improved Url by storing all strings and regular expressions as constant-like variables
* Updated VariableScope tests to account for the changes in key for VariableList
* Added toJSON to VariableScope
* Made variableList use the indexing key property wherever it was manipulating Variable objects
* Updated path variables to be backward compatible with indexing key being 'id' (needed since Variable's indexing property changed to 'key' from `id`)
* Update Variable's indexing property to 'key'
* For consistency, made property-list return blank array when it has no members. + @czardoz
* Updated base Property constructor to not create keys for `name` unless it is defined. Also updated it to re-use it's own instance properties in case the constructor os re-applied on a plain object
* Added variable sync helper function in Collection.
* Provided similar api to deal with collection variables compared to environments and globals
* Moved core value syncing function to variable-list and aliased in variable-scope.
* This allows the syncing functionality to be usable as collection variable
* Added unit tests for VariableScope
* Added `id` property to response schema
* Added VariableScope to better manage environments, globals, etc
* Added function isVariableList - will be needed during working with VariableScope definition
* Added some TODO tasks with respect to Variables and VariableList
* Made PropertyList use it's own list specific flags from prototype and update the flags in list instances based on the type defined - example: _postman_listIndexKey, _postman_listIndexCaseInsensitive.
* This prevents object clutter and adds reliability to the list operation functions
* Made the `disabled` key of properties be added only when one is provided in construction definition. Prevents object clutter
* Used liquid-json to parse response.json() - strips BOM
* Updated Response Property to use relaxed internal JSON parser

#### 0.4.14 (August 24, 2016)
* Tightened dependency requirements to use precise versions only

#### 0.4.13 (August 18, 2016)
* Added tests for the meta properties
* Added a function to get meta properties
* Fix collection constructor `info` block description parsing
* Ensure that meta keywords of base constructor "merges" the properties instead of deleting them.
* Updated propertyBase to pick description from `info` block if provided
* Updated the `_.createDefined` util function to accept a fallback parameter to set default

#### 0.4.12 (August 11, 2016)
* Added a method to get the remote from a url
* Added an option to get the port when it is not specified
* Added Travis CI build notification capability
* Added a method to get the remote from a url
* Maintain integrity of URL query parameters
* Added unparsing tests for query params that lack value
* Fixed dead code and throwback logic in URL constructor and query param getter.
* Updated QueryParam.unparse to internally use unparseSingle -> thus retaining parameter integrity
* Updated query param constructor to inherit from Property (no clue why it was not done) and split the constructor to use `update` function. Also, made the toString() function of query param use `unparseSingle`
* Updated the function of single query param parsing to (1) not trim anything and (2) if value is missing, store it as undefined. These are useful in retaining integrity during unparsing
* Added function to unparse a single query parameter

#### 0.4.11 (August 5, 2016)
* Ensure that aws auth does not use disabled headers

#### 0.4.10 (August 5, 2016)
* Ensure that isEmpty checks in the file content as well
* Corrected the test case name
* Updated the test names, added a testcase for both src and content being empty
* Renamed ref to src
* Ensure that isEmpty checks in the file content as well

#### 0.4.9 (August 4, 2016)
* Updated to use mime-format for guessing mime type
* Added tests for customer reported headers
* Updated to use mime-format for guessing mime type
* Ensure that aws auth does not add duplicate host header
* Fixed a bug which caused url query-parameters to be truncated postmanlabs/postman-app-support#2218
* Ensure that aws auth does not add duplicate host header

#### 0.4.8 (July 31, 2016)
* Ensure that we don't sign unneeded headers

#### 0.4.7 (July 31, 2016)
* Ensure that the oauth1 signature is encoded if necessary

#### 0.4.6 (July 29, 2016)
* Added poly chain variable resolution capability, associated tests (#70)
* Ensure that we do not throw on url stringification

#### 0.4.5 (July 26, 2016)
* Refactored to use unparse (#65)
* Fixed parsing of headers containing colons (#69)
* Fixed parsing of headers containing colons
* Fixed header truncation on initialization
* Updated aws4 version
* Optimized header splitting
* Corrected the test name
* Added ability to specify custom separator when unparsing headers

#### 0.4.4 (July 25, 2016)
* Ensure that properties with empty values can be added to property lists
* Fixed issue in PropertyList.add where isNaN missed the `item` variable as parameter
* removed node v0.12 from travis config, updated it to not try document shenanigans on pull requests

#### 0.4.3 (July 21, 2016)
* Hawk nonce mutation
* Ensure that we create a timestamp for hawk auth (if not given already)
* Removed unnecessary comments
* Ensure that the helper params are mutated, so they can be shown on the UI (#63)

#### 0.4.2 (July 21, 2016)
* Added a check to see if request body is empty (#62)
* Added a check to see if request body is empty
* Fixed whitespace
* Return empty string in the toString method
* Updated the isEmpty function to be more concise
* Updated the oauth1 helper to not forcibly override the nonce and timestamp values (#61)

#### 0.4.1 (July 13, 2016)
* Disabled URL encoding by default (#60)
* Added an option to disable URL encoding
* Disable url encoding by default, and only enable it by specifying an option
* Remove the options in toString for Urls
* Don't unnecessarily create a new object while unparsing URLs
* Optimized query parameter unparsing and added tests for it

#### 0.4.0 (June 28, 2016)
* Ensure that btoa is called directly, otherwise Chrome throws an illeg…
* Response body conversion sugar function
* Ensure that btoa is called directly, otherwise Chrome throws an illegal invocation error
* Added a property to determine whether headers were added as a byprodu…
* Moved HTTP Reason phrase and mime format databases to external module
* Add Response#json function to procure response as POJO. Uses, parse-json module to return more explicit error for JSON parse failures
* Added Response#text function to return response body as text. Also adds utility function to parse buffer (or array buffer) to string
* Moved HTTP Reason phrase and mine format databases to external module
* Added a property to determine whether headers were added as a byproduct of the sdk functions

#### 0.3.3 - 0.3.4 (June 9, 2016)
* Ensure that we create a property-list by default in body parameters

#### 0.3.2 (June 9, 2016)
* Ensure that body contains property lists even if not specified

#### 0.3.1 (June 9, 2016)
* Remove oauth1 params from the body before sending them

#### 0.3.0 (June 9, 2016)
* Case insensitive propertylist lookup index
* Removed the property list construction arg validation since it is not part of this branch's concern
* Updated mime lookup function in mime-format to exclude extra parameters in content type
* Made header property have case insensitive lookup.
* Added ability in PropertyList to do case insensitive lookup and remove. Also added tests.
* Update index.js
* Updated mime lookup function in mime-format to exclude extra parameters in content type
* Made PropertyList call its `super_` and throw error if type parameter is missing
* Added util function to get a property on object if it is defined else, return a default value.

#### 0.2.2 (June 9, 2016)
* Fixed hawk auth nonce generation
* Fix iteration, move string constructors to constants
* Fixed hawk auth nonce generation

#### 0.2.1 (June 8, 2016)
* Correctly add oauth1 params to the request body
* Correctly add oauth1 params to the request body
* Added a hash map for accurate text type detection from mime
* Added ability for Response#dataURI to fallback to response.body string as source in case stream is absent
* Fix arrayBufferToString
* Added a hash map for accurate text type detection from mime in Response property
* Fix arrayBufferToString
* Use Uint8Array contructor instead of 'from' method
* Fixes postmanlabs/postman-collection#44

#### 0.2.0 (June 6, 2016)
* Mime type detection in Response object
* Added ability to return data URI from string, buffer or array buffer
* Added mime and dataURI functions to Response property
* Added `_postman_propertyIndexKey` key in Properties
* Added ability to populate from an object

#### 0.1.4 (June 6, 2016)
* Added a new mode for request body
* The description tag now allows markdown to have HTML
* Moved Base64 to a separate ignored util file and documented the return of Response#mime()
* Mime type detection from buffer body
* Added `_postman_propertyIndexKey` key in Properties to be used for reading in PropertyList to decide the indexing key name
* Added functional test that checks header parsing and load from list in various formats
* Added Header.create and updated the constructor to accept value, key as construction parameter
* Updated PropertyList#populate function to accept an object as well and treat individual keys in them as separate items to be sent to PropertyList.add(). This allows simple object to be used as propertylist source for properties that support Property.create
* Update PropertyList#add function to be a bit more intelligent and use the source Type.create function to add a new item whenever one is available.

#### 0.1.3 (June 5, 2016)
* Allow specifying an src for form parameters, in case we need to handle files
* The description tag now allows markdown to have HTML
* Doc tutorials
* Added a config file for tutorials
* Updated documentation theme
* Added the first tutorial

#### 0.1.2 (June 2, 2016)
* Update the link to docs
* Corrected module name
* Removed long commits
* Documentation updates
* Added documentation for the query parameters.
* Added header documentation
* Updated docs
* Added examples and definition for a cookie
* Formdata handling
* hotfix: use the correct service name in the aws auth helper
* Return an empty string for form-data when stringifying a body
* Ensure that toString always returns a string
* Ensure that the raw body can be stringified
* Fix the order in which request body is processed
* Ensure that we don't have an empty block - messes with the code style checks
* Remove unnecessary error in request body stringification

#### 0.1.1 (May 24, 2016)
* Fixed the handling of function variables in a URL
* Allow injecting default variables in the substitutor
* Fixed the handling of function variables in a URL

#### 0.1.0 (May 23, 2016)
* Move the default vars outside the main variable-list constructor
* Added recursive variable resolution capabilities
* Improved variable naming, optimized intra-method declarations, shifted resolution limit to a static member, reversed loop direction.
* Use the new SuperString in Property for variable replacement
* Add SuperString object t abstract variable replacement from collections
* Removed superfluous string comparisons, adjusted loopCounter to start at 0 instead of -1
* Added recursive variable resolution capabilities
* Delimited iterative resolution depth to 20 cycles
* Added tests for recursion depth and cyclic resolution handling
* Move the default vars outside

#### 0.0.18 (May 18, 2016)
* Added ability to substitute function variables, and tests
* Removed unnecessary addition of function to allowed types, use Date.now() instead of getTime()
* Corrected the implementation, and moved the default function variables to the right location.
* Add `_.find` in SDK for property List
* added a test for finding in a list
* Added support for function variables
* Remove double quotes from everywhere
* Added a test for variable substitution

#### 0.0.17 (May 6, 2016)
* Added the ability to iterate over itemgroups

#### 0.0.16 (May 6, 2016)
* Ensure that request descriptions are always
* Version is not longer a part of description
* Ensure that request descriptions are always returned when calling toJSON()

#### 0.0.15 (May 6, 2016)
* Import property-base
* Fixed a broken change

#### 0.0.14 (May 6, 2016)
* Documentation changes, some bug fixes (and out of context feature of variable substitution in Property)
* Moved all substitution functions back in Property and made PropertyBase private
* Made PropertyBase documentation public until the substitution functions are moved to property.
* Updated VariableList to use variable substitution logic from PropertyBase instead of within itself
* Added function to recursively substitute variables in an object from PropertyBase.replaceSubstitutionsIn
* Added replaceSubstitutions function in PropertyBase to replace variable substitutions directly from Property instead of VariableList
* Updated `util._.findValue` to also accept VariableList as a data source. This will allow for easier usage of this utility function while using from a place that cannot refer to VariableList. (One caveat is that this now uses `_postman_propertyName` to detect VariableList and a note has been added to ensure that this is not changed)
* Documentation typo fixes in Description property
* Added fake nsp scripts to exclude "marked" vulnerability. Also added infra tests for the same

#### 0.0.13 (April 7, 2016)
* Fix url param stringification

#### 0.0.12 (April 4, 2016)
* Added http reason phrases
* Added tests for response code and reason phrase (status)
* Added http reason phrases

#### 0.0.12-beta.1 (April 2, 2016)
* Added ability of Property.toObjectResolved to accept additional override sources
* Removed the duplicate "disabled" processing of Event and elaborated the documentation
* Somewhat elaborated the documentation of `PropertyBase` (at least the items that gets inherited)
* Fix issue with the newly added private `_nocast` parameter to `Variable#valueType` function
* Adds definition, examples and other documentation to Item property
* Updated `Item` property to proceed with construction even when no definition object is provided
* `ItemGroup` construction definition documentation added
* Allowed `ItemGroup` to be initialised without a construction object
* Updated `Property.toObjectResolved` to accept and forward an additional `overrides` parameter to the substitution function of variable replacement
* Updated the .replace and .substitute to accept an additional `overrides` parameter to accept an array of objects for additional variable resolution lookup
* Added lodash utility function `_.findValue` that returns the value of a key within an array of objects
* Renamed the internal `_postman_isGroup` flag to match the other flag names. Now it is called `_postman_propertyIsList`
* Added variable constructor definition typeDef in documentation
* Added collection constructor definition typeDef in documentation

#### 0.0.11 (March 25, 2016)
* Fixed undefined values for propertylists
* Add nsp to infra test
* Update hawk library version
* Wiki publish script truncation fix.
* Fixes the wiki publish script by ensuring that the Home.md file content is created before doing modifications to sidebar data
* Automatically deploy documentation to GH Pages from Travis CI
* Added npm run publish-wiki
* Added function to create markdown wiki reference in out/wiki
* Move npmignore block to the top of the file
* Ignore ci related files in npm publish config
* Updated travis config to publish when new tags are pushed
* Adding publish script to package.json
* Adding encrypted key

#### 0.0.10 (March 21, 2016)
* Added a new function to check whether an object is a collection
* Removed unnecessary import
* Added notice in README.
* Added draft and private `Property#toObjectResolved` to procure an Obj…
* Added a new function to check whether an object is a collection

#### 0.0.9 (March 21, 2016)
* Made the README documentation link point to the wiki
* Jsdoc documentation fixes
* Updated README to point to the SDK documentation
* Added draft and private `Property#toObjectResolved` to procure an Object representation of a property with its variables resolved.
* Url Parser Fixes
* Fixed the failing dependent tests due to auth changes in Url
* Updated the url parsing algorithm to be able to better extract port and auth
* Added a bunch of tests for Url parser (around ipv4 addresses)
* Fixed issue in Url path parsing where leading slash was needlessly being added.
* Made the url parser code more readable (relatively) by merging the object assignment and regex extractions
* Fixed path parsing where path splitting was not being done correctly
* Fixed issue with invalid regex in port parsing of URL
* Updated URL parser to return url.auth as undefined when no username or password was extracted
* Better `isPropertyX`
* Added property name to all constructors and a test to ensure it is present
* Removed extra property in Item prototype
* Renamed snake cased `_postman_property_name` to `_postman_propertyName`
* More infra tests
* Updated the `isPropertyX` static functions to use `_postman_property_name` in super chain to determine validity of property
* Added `_postman_property_name` to all Properties that has an isX static function
* Added utility function that finds equality of a variable through the super chain
* Added tests for schema file existence
* Used the schema-compiler package to compile schema via npm run build-schema
* Private environment access API
* Added todo for future improvement of `VariableList#env`
* Add `VariableList#env` private function to perform environment manipulation (also test updated since .environments array was made private)
* Fixed documentation of PropertyList.insertAfter and made `_postman_isGroup` as private
* Added Schema files to this repository
* Fined breaking documentation generation due to blank example tag in property-base
* Added form param to the sdk exports
* Ensure that all modules are exported
* Added infra test for Module Inheritance
* Made `PropertyList` inherit from `Base`
* Fix issue where `Version` was not being inherited from `PropertyBase`
* Fix issue where new collection without options was throwing an error

#### 0.0.8 (March 14, 2016)
* Implementation of a generic toJSON
* Added test for installation of packages.
* Added test for installation of packages.
* Added a custom clone method, removed import of `PropertyList` from `PropertyBase`
* Added a check for null values
* Reverting change to example code
* Inherit `FormParam` and `QueryParam` from `Property`
* Added a root `toJSON` for `PropertyList` as well
* Reformatted file for easy comparison
* Added a generic `toJSON` function
* Removing all `toJSON` methods, to consolidate them into a single one
* Inherit FormParam and QueryParam from Property
* Added unit tests that checks the description related functionalities of a property
* Added documentation to the `Description` constructor
* Added `.describe` helper function in Property
* Added `.update` function to `Description` property. Also added `isDescription` to `Description` static methods.

#### 0.0.7 (February 29, 2016)
* Additional renames in auth helpers
* Additional renames in auth helpers

#### 0.0.6 (February 29, 2016)
* Rename request-data to request-body
* Added jsDoc documentation to properties trailing one level from collection.js
* added docs for description and event list
* Moved the detection if `id` required properties and its auto generation to property.js
* Initial commit with code migrated from proof-of-concept stage
