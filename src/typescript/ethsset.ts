/// <reference path="node.d.ts" />

interface rule {
    rule: string;
    cmd: string;
    desc?: string;
}

interface edge {
    to: string;
    from: string;
    using: string;

    active?: boolean;
}

interface glob_edge {
    pattern: string;

    srcBase?: string;
    destBase?: string;
    flatten?: boolean;
}

interface config_desc {
    ninja?: {
        version?: string;
        buildpath?: string;
        buildfile?: string;
    };
    rules: rule[];
    edges: edge[];
    globedges?: glob_edge[];
}

var ConfigFilePath: string = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');

if(!fs.existsSync(ConfigFilePath))
{
    console.log('Creating default ethsset.json');
    var Config: config_desc = {
        rules: [],
        edges: [],
        globedges: []
    };

    fs.writeFileSync(ConfigFilePath, JSON.stringify(Config, null, 4));
}

var EthssetConfig: config_desc = require(ConfigFilePath);
var Ninja = NinjaGen(EthssetConfig.ninja.version, EthssetConfig.ninja.buildpath || 'ethsset_build');

var globule = require('globule');
var sys = require('sys');
var exec = require('child_process').exec;

function generateNinjaBuild(EthssetConfig: config_desc)
{
    var Rules: rule[], Edges: edge[], GlobEdge: glob_edge[];
    Rules = EthssetConfig.rules || [];
    Edges = EthssetConfig.edges || [];
    GlobEdge = EthssetConfig.globedges || [];

    Rules.forEach(function(Rule: rule) {
        if(Rule.rule != null && Rule.cmd != null)
        {
            Ninja
                .rule(Rule.rule)
                .run(Rule.cmd)
                .description(Rule.desc || ('['+Rule.rule+'] ' + Rule.cmd));
        }
        else
        {
            console.log('Invalid rule ', Rule, ' requires "rule" and "cmd"')
        }
    });

    Edges.forEach(function(Edge: edge) {
        if(!(Util.isNullOrUndefined(Edge.to) || Util.isNullOrUndefined(Edge.from) || Util.isNullOrUndefined(Edge.using)))
        {
            Ninja.edge(Edge.to).from(Edge.from).using(Edge.using);
        }
        else
        {
            console.log('Invalid edge ', Edge, ' requires "to", "from" and "using"')
        }
    });

    GlobEdge.forEach(function(GlobEdge: glob_edge) {

        var GlobOptions = {
            srcBase: GlobEdge.srcBase || '',
            destBase: GlobEdge.destBase || '',
            flatten: GlobEdge.flatten || false
        }
        console.log(GlobEdge, "::", GlobOptions);
        var GlobResult: string[] = globule.findMapping(GlobEdge.pattern, GlobOptions);

        console.log(GlobResult);
    });

    Ninja.save('build.ninja');
}

generateNinjaBuild(EthssetConfig);
console.log(Ninja);


function executeNinjaBuild(BuildFilePath: string = 'build.ninja') {
    function puts(error, stdout, stderr) {
        console.log(stdout);
    }
    exec(Util.format('ninja -f %s', BuildFilePath), puts);
}
executeNinjaBuild(EthssetConfig.ninja.buildfile);



// Exports 
exports.executeNinjaBuild = executeNinjaBuild;
exports.generateNinjaBuild = generateNinjaBuild;