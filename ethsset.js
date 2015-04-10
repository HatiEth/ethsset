/// <reference path="node.d.ts" />
var IsDryMode = (process.argv.splice(2)[0] === 'test');
if (IsDryMode) {
    console.log("Running ethsset in test mode");
}
var ConfigFilePath = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');
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
if (EthssetConfig.ninja === void 0) {
    Ninja = NinjaGen(undefined, 'ethsset_build');
}
else {
    Ninja = NinjaGen(EthssetConfig.ninja.version, EthssetConfig.ninja.buildpath || 'ethsset_build');
}
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
            flatten: GlobEdge.flatten || false
        };
        console.log(GlobEdge, "::", GlobOptions);
        var GlobResult = globule.findMapping(GlobEdge.pattern, GlobOptions);
        console.log(GlobResult);
        GlobResult.forEach(function (Result) {
            Ninja.edge(Result.dest).from(Result.src).using(GlobEdge.rule);
        });
    });
    Ninja.save('build.ninja', function () {
        executeNinjaBuild(EthssetConfig.ninja.buildfile);
    });
}
console.log(Ninja);
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
