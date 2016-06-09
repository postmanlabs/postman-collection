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
        return mime && (mime = String(mime)) && (mime = mime.replace(/^\s*?([^;\s]+).*$/g, '$1')) && db[mime] || {
            type: (mime = mime.split(SEP)) && mime[0],
            format: 'raw'
        };
    }
};
