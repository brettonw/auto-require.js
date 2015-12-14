var _path = require ("path");
var _fs = require ("fs");
var _cp = require ("child_process");
var _os = require ("os");

// fileExists - internal helper function because the Node.js "fs" package has
// deprecated the "exists" method, and the "approved" async way of getting stat throws
// an exception if the file doesn't exist (who is responsible for the API design here?
// amateur much?)
var fileExists = function (path) {
    try {
        var stats = _fs.statSync (path);
        return true;
    }
    catch (exc) {
    }
    return false;
};

var chop = function (str) {
    var isWhiteSpace = function (c) {
        var whiteSpaceChars = [' ','\n','\r','\t'];
        whiteSpaceChars.forEach (function (cc) {
            if (cc == c) return true;
        });
        return false;
    };
    var start = 0;
    while (isWhiteSpace (str.charAt (start))) { ++start; }
    var end = str.length - 1;
    while (isWhiteSpace (str.charAt (end))) { --end; }
    return str.substr (start, end - start);
}

// getNpmRoot - internal helper function to synchronously run npm and return the output
// as a string
var getNpmRoot = function () {
    // compute a temporary name for the file I want to use to facilitate my synchronous
    // execution of the npm root command
    var outputName = _path.join (__dirname, "" + Date.now ());
    //process.stderr.write (outputName + "\n");

    // compute the path of the npm.js script, and set up the options to run it
    var npm = _path.join(__dirname, "npm.js");
    var options = { stdio: ["ignore", 1, 2] };
    _cp.spawnSync("node", [npm, "root", outputName], options);

    // read the output file back in, then remove it, and chop the return
    var result = _fs.readFileSync(outputName, "utf8");
    _fs.unlinkSync(outputName);
    return chop (result);
}

var requireAuto = function (name) {
    // WELLLLL (church lady voice) - npm is *SPECIAL*. Rather than try to look simply
    // for where npm will put the included packages, I'll have to ask npm directly
    var path = getNpmRoot ();
    //process.stderr.write ("Path (" + path + ")\n");

    // figure out where our package should be
    var package = _path.join (path, name);
    //process.stderr.write ("Package (" + package + ")\n");
    if (! fileExists (package)) {
        process.stderr.write ("install (" + name + ")\n");
        var options = { stdio: [0, 1, 2] };
        _cp.spawnSync("npm", ["install", name], options);
    }
    return require (name);
};

module.exports = requireAuto;
