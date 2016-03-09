var _ = require('../util').lodash,
    ItemGroup = require('./item-group').ItemGroup,
    VariableList = require('./variable-list').VariableList,

    Collection, // constructor

    SCHEMA_URL = 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json';

_.inherit((
    /**
     * Create or load an instance of [Postman Collection](https://www.getpostman.com/docs/collections) as a JavaScript
     * object that can be manipulated easily.
     *
     * A collection lets you group individual requests together. These requests can be further organized into folders to
     * accurately mirror your API. Requests can also store sample responses when saved in a collection. You can add
     * metadata like name and description too so that all the information that a developer needs to use your API is
     * available easily.
     * @constructor
     * @extends {ItemGroup}
     *
     * @param {Object=} [definition] - Pass the initial definition of the collection (name, id, etc) as the `definition`
     * parameter. The definition object is structured exactly as the collection format as defined in
     * [https://www.schema.getpostman.com/](https://www.schema.getpostman.com/). This parameter is optional. That
     * implies that you can create an empty instance of collection and add requests and other properties in order to
     * build a new collection.
     * @param {Array<Object>=} [environments] - The collection instance constructor accepts the second parameter as an
     * array of environment objects. Environments objects store variable definitions that are inherited by
     * {@link Collection#variables}. These environment variables are usually the ones that are exported from the Postman
     * App to use them with different collections. Refer to Postman
     * [documentation on environment variables](https://www.getpostman.com/docs/environments).
     *
     * @example <caption>Load a Collection JSON file from disk</caption>
     * var fs = require('fs'), // needed to read JSON file from disk
     *     pretty = function (obj) { // function to neatly log the collection object to console
     *         return require('util').inspect(obj, {colors: true});
     *     },
     *     Collection = require('postman-collection').Collection,
     *     myCollection;
     *
     * // Load a collection to memory from a JSON file on disk (say, sample-collection.json)
     * myCollection = new Collection(JSON.stringify(fs.readFileSync('sample-collection.json').toString()));
     *
     * // log items at root level of the collection
     * console.log(inspect(myCollection));
     *
     * @example <caption>Create a blank collection and write to file</caption>
     * var fs = require('fs'),
     *     Collection = require('postman-collection').Collection,
     *     mycollection;
     *
     * myCollection = new Collection({
     *     info: {
     *         name: "my Collection"
     *     }
     * });
     *
     * // log the collection to console to see its contents
     * fs.writeFileSync('myCollection.postman_collection', myCollection.toString());
     */
    Collection = function PostmanCollection (definition, environments) {
        // this constructor is intended to inherit and as such the super constructor is required to be excuted
        Collection.super_.call(this, definition);

        _.extend(this, /** @lends Collection.prototype */ {
            /**
             * The `variables` property holds a list of variables that are associated with a Collection. These variables
             * are stored within a collection so that they can be re-used and replaced in rest of the collection. For
             * example, if one has a variable named `port` with value `8080`, then one can write a request {@link Url}
             * as `http://localhost:{{port}}/my/endpoint` and that will be replaced to form
             * `http://localhost:8080/my/endpoint`. **Collection Variables** are like
             * [environment variables](https://www.getpostman.com/docs/environments), but stored locally within a
             * collection.
             *
             * @type {VariableList}
             *
             * @example <caption>Creating a collection with variables</caption>
             * var fs = require('fs'),
             *     Collection = require('postman-collection').Collection,
             *     mycollection;
             *
             * // Create a new empty collection.
             * myCollection = new Collection();
             *
             * // Add a variable to the collection
             * myCollection.variables.add({
             *     id: 'apiBaseUrl',
             *     value: 'http://timeapi.org',
             *     type: 'string'
             * });
             *
             * //Add a request that uses the variable that we just added.
             * myCollection.items.add({
             *     id: 'utc-time-now',
             *     name: 'Get the current time in UTC',
             *     request: '{{apiBaseUrl}}/utc/now'
             * });
             */
            variables: new VariableList(this, definition.variable, environments)
        });
    }), ItemGroup);

_.extend(Collection.prototype, {
    toJSON: function () {
        return {
            info: {
                id: this.id,
                name: this.name,
                version: this.version,
                schema: SCHEMA_URL
            },
            event: this.events.toJSON(),
            variable: this.variables.toJSON(),
            item: this.items.toJSON()
        };
    }
});

module.exports = {
    Collection: Collection
};
