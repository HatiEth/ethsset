/// <reference path="node.d.ts" />
var ConfigFilePath = process.cwd() + '/ethsset.json';
var fs = require('fs');
var Util = require('util');
var NinjaGen = require('ninja-build-gen');
var Ninja = NinjaGen('1.5.3', 'ethsset_build');
if (!fs.existsSync(ConfigFilePath)) {
    console.log('Creating default ethsset.json');
    var Config = {
        rules: [],
        edges: []
    };
    fs.writeFileSync(ConfigFilePath, JSON.stringify(Config, null, 4));
}
var EthssetConfig = require(ConfigFilePath);
var sys = require('sys');
var exec = require('child_process').exec;
var Rules = EthssetConfig.rules;
var Edges = EthssetConfig.edges;
function printRules(config) {
    console.log(Rules);
}
printRules(Rules);
