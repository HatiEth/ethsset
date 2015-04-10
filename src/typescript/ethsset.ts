/// <reference path="node.d.ts" />
interface rule {
    rule: string;
    cmd: string;
    desc?: string;
};

interface edge {
    to: string;
    from: string;
    using: string;
}

interface ConfigDesc {
    ninja: {
        version: string;
        buildpath?: string;
        buildfile?: string;
    };
    rules: rule[];
    edges: edge[];
};

var ConfigFilePath: string = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');

if(!fs.existsSync(ConfigFilePath))
{
    console.log('Creating default ethsset.json');
    var Config: ConfigDesc = {
        ninja: {
            version: '1.5.3'
        },
        rules: [],
        edges: []
    };

    fs.writeFileSync(ConfigFilePath, JSON.stringify(Config, null, 4));
}

var EthssetConfig: ConfigDesc = require(ConfigFilePath);
var Ninja = NinjaGen(EthssetConfig.ninja.version, EthssetConfig.ninja.buildpath || 'ethsset_build');
var sys = require('sys');
var exec = require('child_process').exec;

function generateNinjaBuild(Rules: rule[], Edges: edge[])
{
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

    Ninja.save('build.ninja');
}

generateNinjaBuild(EthssetConfig.rules, EthssetConfig.edges);
console.log(Ninja);


function executeNinjaBuild(BuildFilePath: string = 'build.ninja') {
    function puts(error, stdout, stderr) {
        console.log(stdout);
    }
    exec(Util.format('ninja -f %s', BuildFilePath), puts);
}
executeNinjaBuild(EthssetConfig.ninja.buildfile);