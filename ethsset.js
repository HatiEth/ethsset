var ethssetConfig = require('./ethsset.json');
var ninjaBuildGen = require('ninja-build-gen');
var ninja = ninjaBuildGen('1.5.3', 'build');

console.log(ethssetConfig);

ninja
    .rule(ethssetConfig[0].rule)
    .run(ethssetConfig[0].cmd)
    .description(ethssetConfig[0].desc);


ninja
    .edge('./out/hello.txt')
    .from('hello.txt')
    .using('copy');


console.log(ninja);
console.log(ninja.clauses[1].targets);
/*

ninja
    .rule('copy')
    .run('cp $in $out')
    .description('Copy $in to $out');


ninja.save('build.ninja');
*/




