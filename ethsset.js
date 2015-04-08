// Generated by CoffeeScript 1.8.0
(function() {
  var Edges, Rules, edge, ethssetConfig, exec, ninja, ninjaBuildGen, puts, rule, sys, _i, _j, _len, _len1;

  ethssetConfig = require(process.cwd() + '/ethsset.json');

  ninjaBuildGen = require('ninja-build-gen');

  ninja = ninjaBuildGen('1.5.3', 'ethsset_build');

  sys = require('sys');

  exec = require('child_process').exec;

  Rules = ethssetConfig.rules;

  Edges = ethssetConfig.edges;

  console.log('Rules: ', Rules);

  console.log('Edges: ', Edges);

  for (_i = 0, _len = Rules.length; _i < _len; _i++) {
    rule = Rules[_i];
    if ((rule.rule != null) && (rule.cmd != null) && (rule.desc != null)) {
      ninja.rule(rule.rule).run(rule.cmd).description(rule.desc);
    }
  }

  for (_j = 0, _len1 = Edges.length; _j < _len1; _j++) {
    edge = Edges[_j];
    if ((edge.to != null) && (edge.from != null) && (edge.using != null)) {
      ninja.edge(edge.to).from(edge.from).using(edge.using);
    }
  }

  console.log('ninja.build: ', ninja);

  ninja.save('build.ninja');

  puts = function(error, stdout, stderr) {
    return console.log(stdout);
  };

  exec('ninja', puts);

}).call(this);
