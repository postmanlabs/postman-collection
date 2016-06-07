var /**
     * @private
     * @type {Object}
     */
    db = require('./db.json'),
    /**
     * @private
     * @const
     * @type {String}
     */
    SEP = '/';

module.exports = {
    /**
     * @param {String} mime - contentType header value
     * @returns {String} - 'text', 'application', 'image', 'video', 'audio' or false
     */
    lookup: function mimeFormatLookup (mime) {
        return db[mime] || {
            type: mime && (mime = mime.split(SEP)) && mime[0],
            format: 'raw'
        };
    }
};
