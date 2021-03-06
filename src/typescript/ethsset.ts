/// <reference path="node.d.ts" />

interface rule {
    name: string;
    cmd: string;
    desc?: string;
}

interface edge {
    to: string;
    from: string;
    rule: string;
    active?: boolean;
}

interface glob_edge {
    pattern: string;
    rule: string;
    srcBase?: string;
    destBase?: string;
    flatten?: boolean;
    ext?: string;
}

interface glob_mapping {
    src: string[];
    dest: string;
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

var IsDryMode: boolean = (process.argv.splice(2)[0] === 'test');
var ConfigFilePath: string = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');

// ------------------------------------ Code ------------------------------------ // 

console.log(Util.format("Running ethsset %s", IsDryMode ? "in test mode" : ""));
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

var Ninja;
var NinjaBuildVersion: string = (EthssetConfig.ninja && EthssetConfig.ninja.version) || undefined;
var NinjaBuildPath: string = (EthssetConfig.ninja && EthssetConfig.ninja.buildpath) || 'ethsset_build';
var NinjaBuildFile: string = (EthssetConfig.ninja && EthssetConfig.ninja.buildfile) || 'build.ninja';

var Ninja = NinjaGen(NinjaBuildVersion, NinjaBuildPath);

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
        if(Rule.name != null && Rule.cmd != null)
        {
            Ninja
                .rule(Rule.name)
                .run(Rule.cmd)
                .description(Rule.desc || ('['+Rule.name+'] ' + Rule.cmd));
        }
        else
        {
            console.log('Invalid rule ', Rule, ' requires "name" and "cmd"')
        }
    });

    Edges.forEach(function(Edge: edge) {
        if(!(Util.isNullOrUndefined(Edge.to) || Util.isNullOrUndefined(Edge.from) || Util.isNullOrUndefined(Edge.rule)))
        {
            Ninja.edge(Edge.to).from(Edge.from).using(Edge.rule);
        }
        else
        {
            console.log('Invalid edge ', Edge, ' requires "to", "from" and "rule"')
        }
    });

    GlobEdge.forEach(function(GlobEdge: glob_edge) {

        var GlobOptions = {
            srcBase: GlobEdge.srcBase || '',
            destBase: GlobEdge.destBase || '',
            flatten: GlobEdge.flatten || false,
            ext: GlobEdge.ext || ''
        };
        var GlobResult: glob_mapping[] = globule.findMapping(GlobEdge.pattern, GlobOptions);

        if(IsDryMode)
        {
            console.log(GlobEdge, "::", GlobOptions);
            console.log(GlobResult);
        }

        GlobResult.forEach(function(Result: glob_mapping) {
            Ninja.edge(Result.dest).from(Result.src).using(GlobEdge.rule);
        });
    });

    Ninja.save(NinjaBuildFile, function() {
        executeNinjaBuild(NinjaBuildFile);
    });
}

if(IsDryMode)
{
    console.log(Ninja);
}


function executeNinjaBuild(BuildFilePath: string = 'build.ninja') {
    function puts(error, stdout, stderr) {
        console.log(stdout);
    }
    if (IsDryMode)
    {
        exec(Util.format('ninja -n -f %s', BuildFilePath), puts);
    }
    else
    {
        exec(Util.format('ninja -f %s', BuildFilePath), puts);
    }
}

generateNinjaBuild(EthssetConfig);

// Exports 
exports.executeNinjaBuild = executeNinjaBuild;
exports.generateNinjaBuild = generateNinjaBuild;