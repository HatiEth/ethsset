/// <reference path="node.d.ts" />
var IsDryMode = (process.argv.splice(2)[0] === 'test');
var ConfigFilePath = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');
// ------------------------------------ Code ------------------------------------ // 
console.log(Util.format("Running ethsset %s", IsDryMode ? "in test mode" : ""));
if (!fs.existsSync(ConfigFilePath)) {
    console.log('Creating default ethsset.json');
    var Config = {
        rules: [],
        edges: [],
        globedges: []
    };
    fs.writeFileSync(ConfigFilePath, JSON.stringify(Config, null, 4));
}
var EthssetConfig = require(ConfigFilePath);
var Ninja;
var NinjaBuildVersion = (EthssetConfig.ninja && EthssetConfig.ninja.version) || undefined;
var NinjaBuildPath = (EthssetConfig.ninja && EthssetConfig.ninja.buildpath) || 'ethsset_build';
var NinjaBuildFile = (EthssetConfig.ninja && EthssetConfig.ninja.buildfile) || 'build.ninja';
var Ninja = NinjaGen(NinjaBuildVersion, NinjaBuildPath);
var globule = require('globule');
var sys = require('sys');
var exec = require('child_process').exec;
function generateNinjaBuild(EthssetConfig) {
    var Rules, Edges, GlobEdge;
    Rules = EthssetConfig.rules || [];
    Edges = EthssetConfig.edges || [];
    GlobEdge = EthssetConfig.globedges || [];
    Rules.forEach(function (Rule) {
        if (Rule.name != null && Rule.cmd != null) {
            Ninja
                .rule(Rule.name)
                .run(Rule.cmd)
                .description(Rule.desc || ('[' + Rule.name + '] ' + Rule.cmd));
        }
        else {
            console.log('Invalid rule ', Rule, ' requires "name" and "cmd"');
        }
    });
    Edges.forEach(function (Edge) {
        if (!(Util.isNullOrUndefined(Edge.to) || Util.isNullOrUndefined(Edge.from) || Util.isNullOrUndefined(Edge.rule))) {
            Ninja.edge(Edge.to).from(Edge.from).using(Edge.rule);
        }
        else {
            console.log('Invalid edge ', Edge, ' requires "to", "from" and "rule"');
        }
    });
    GlobEdge.forEach(function (GlobEdge) {
        var GlobOptions = {
            srcBase: GlobEdge.srcBase || '',
            destBase: GlobEdge.destBase || '',
            flatten: GlobEdge.flatten || false,
            ext: GlobEdge.ext || ''
        };
        var GlobResult = globule.findMapping(GlobEdge.pattern, GlobOptions);
        if (IsDryMode) {
            console.log(GlobEdge, "::", GlobOptions);
            console.log(GlobResult);
        }
        GlobResult.forEach(function (Result) {
            Ninja.edge(Result.dest).from(Result.src).using(GlobEdge.rule);
        });
    });
    Ninja.save(NinjaBuildFile, function () {
        executeNinjaBuild(NinjaBuildFile);
    });
}
if (IsDryMode) {
    console.log(Ninja);
}
function executeNinjaBuild(BuildFilePath) {
    if (BuildFilePath === void 0) { BuildFilePath = 'build.ninja'; }
    function puts(error, stdout, stderr) {
        console.log(stdout);
    }
    if (IsDryMode) {
        exec(Util.format('ninja -n -f %s', BuildFilePath), puts);
    }
    else {
        exec(Util.format('ninja -f %s', BuildFilePath), puts);
    }
}
generateNinjaBuild(EthssetConfig);
// Exports 
exports.executeNinjaBuild = executeNinjaBuild;
exports.generateNinjaBuild = generateNinjaBuild;
