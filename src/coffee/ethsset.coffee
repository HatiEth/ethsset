ethssetConfig = require('./ethsset.json');
ninjaBuildGen = require('ninja-build-gen');
ninja = ninjaBuildGen('1.5.3', 'ethsset_build');

Rules = ethssetConfig.rules;
console.log(Rules);

i;
for rule of Rules
    ninja
        .rule(Rules[i].rule)
        .run(Rules[i].cmd)
        .description(Rules[i].desc);

###
for(i = 0; i<Rules.length;++i)
{
    if(Rules[i].hasOwnProperty('rule'))
    {
        ninja
            .rule(Rules[i].rule)
            .run(Rules[i].cmd)
            .description(Rules[i].desc);
    }
}
###

Edges = ethssetConfig.edges;
console.log(Edges);
###
for(i = 0; i<Edges.length;++i)
{
    if(Edges[i].hasOwnProperty('from')
        && Edges[i].hasOwnProperty('to')
        && Edges[i].hasOwnProperty('using'))
    {
        ninja
            .edge(Edges[i].to)
            .from(Edges[i].from)
            .using(Edges[i].using);
    }
}
###
###
ninja
    .edge('./out/hello.txt')
    .from('hello.txt')
    .using('copy');
###

console.log(ninja);

###
ninja
    .rule('copy')
    .run('cp $in $out')
    .description('Copy $in to $out');


###

ninja.save('build.ninja');



