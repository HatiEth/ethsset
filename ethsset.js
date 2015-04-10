/// <reference path="node.d.ts" />
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
var Ninja = NinjaGen(EthssetConfig.ninja.version, EthssetConfig.ninja.buildpath || 'ethsset_build');
var globule = require('globule');
var sys = require('sys');
var exec = require('child_process').exec;
function generateNinjaBuild(EthssetConfig) {
    var Rules, Edges, GlobEdge;
    Rules = EthssetConfig.rules || [];
    Edges = EthssetConfig.edges || [];
    GlobEdge = EthssetConfig.globedges || [];
    Rules.forEach(function (Rule) {
        if (Rule.rule != null && Rule.cmd != null) {
            Ninja
                .rule(Rule.rule)
                .run(Rule.cmd)
                .description(Rule.desc || ('[' + Rule.rule + '] ' + Rule.cmd));
        }
        else {
            console.log('Invalid rule ', Rule, ' requires "rule" and "cmd"');
        }
    });
    Edges.forEach(function (Edge) {
        if (!(Util.isNullOrUndefined(Edge.to) || Util.isNullOrUndefined(Edge.from) || Util.isNullOrUndefined(Edge.using))) {
            Ninja.edge(Edge.to).from(Edge.from).using(Edge.using);
        }
        else {
            console.log('Invalid edge ', Edge, ' requires "to", "from" and "using"');
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
    });
    Ninja.save('build.ninja');
}
generateNinjaBuild(EthssetConfig);
console.log(Ninja);
function executeNinjaBuild(BuildFilePath) {
    if (BuildFilePath === void 0) { BuildFilePath = 'build.ninja'; }
    function puts(error, stdout, stderr) {
        console.log(stdout);
    }
    exec(Util.format('ninja -f %s', BuildFilePath), puts);
}
executeNinjaBuild(EthssetConfig.ninja.buildfile);
// Exports 
exports.executeNinjaBuild = executeNinjaBuild;
exports.generateNinjaBuild = generateNinjaBuild;
