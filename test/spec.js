var webshot = require('webshot');
var Q = require('kew');
var sha1 = require('./sha1');

var WEBSHOT_OPTIONS = {
    screenSize : { width: 250, height: 500 },
    takeShotOnCallback: true
};

function getScreenshot() {
    var deferred = Q.defer();
    webshot('http://localhost:4000', './test/img/current.png', WEBSHOT_OPTIONS, function () {
        deferred.resolve(true);
    });
    return deferred;
}

it('should make the images transparent based on high pass or flood fill pixel filters', function (done) {
    getScreenshot()
        .then(function () {
            return Q.all([
                sha1('./test/img/current.png'),
                sha1('./test/img/ref.png')
            ]);
        })
        .then(function (hashes) {
            if (hashes[0] === hashes[1]) {
                done();
            } else {
                done(new Error('Images differ!'));
            }
        });
});