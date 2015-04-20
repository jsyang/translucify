var fs = require('fs');
var crypto = require('crypto');
var Q = require('kew');

/**
 * @param {string} filename
 * @returns {!Promise.<string>}
 */
function getSHA1(filename) {
    var deferred = Q.defer();

    var fd = fs.createReadStream(filename);
    var hash = crypto.createHash('sha1');
    hash.setEncoding('hex');

    fd.on('end', function() {
        hash.end();
        deferred.resolve(hash.read());
    });

    fd.pipe(hash);

    return deferred;
}

module.exports = getSHA1;