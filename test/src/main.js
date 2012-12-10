/*jslint browser: true*/
/*global test, ok, define*/

define(function (require) {
    var math = require('./math');

    test('math.plus', function () {
        ok(3 === math.plus(1, 2));
    });
});
