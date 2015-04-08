# Configuration file
ethssetConfig = require './ethsset.json'

# Ninja
ninjaBuildGen = require 'ninja-build-gen'
ninja = ninjaBuildGen '1.5.3', 'ethsset_build'

# Exec
sys = require('sys')
exec = require('child_process').exec

Rules = ethssetConfig.rules;
Edges = ethssetConfig.edges;

console.log('Rules: ', Rules);
console.log('Edges: ', Edges);

for rule in Rules
    ninja
        .rule(rule.rule)
        .run(rule.cmd)
        .description(rule.desc) if rule.rule? and rule.cmd? and rule.desc?


for edge in Edges
    ninja
        .edge(edge.to)
        .from(edge.from)
        .using(edge.using) if edge.to? and edge.from? and edge.using?

console.log('ninja.build: ', ninja);

ninja.save('build.ninja');

# Running Ninja in current directory
puts = (error, stdout, stderr) -> console.log(stdout)
exec('ninja', puts)

