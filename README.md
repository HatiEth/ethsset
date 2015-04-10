# ethsset

ethsset is a [node.js](https://nodejs.org/)+[Ninja](https://nodejs.org/) based Asset Pipeline.

[TOC]

## Installation
ethsset is best being installed globally if used for command-line.
`ninja` has to be installed on your computer, either by npm or "normally" and be in your PATH.

## Usage

ethsset requires an `ethsset.json` in its executed directory.
If no `ethsset.json` exists ethsset will create an default one for you on first call.
The `ethsset.json` has the following structure:

    {
        ninja?: {
            version?: string;
            buildpath?: string; | 'ethsset_build'
            buildfile?: string; | 'build.ninja'
        };
        rules: rule[];
        edges: edge[];
        globedges?: glob_edge[];
    }

**Anything marked with `?` is an optional parameter. The default value if any is described with `| value`.**
For example: You can specify the version of Ninja atleast required, but it is purely optional.

### Testing ethsset

You can test your configuration by using the `ethsset test` command. This will perform a dry run on ninja executing no actual tasks but providing the same output as if run normally.

### Ninja Configuration (ninja)

	{
    	version?: string,
        buildpath?: string; | 'ethsset_build'
        buildfile?: string; | 'build.ninja'
    }

`version` defines the version of **ninja** required by the executed system.
`buildpath` defines in which folder the ninja will place its files relative to the executed directory.
`buildfile` defines the output file name of ninja.



### Rules (rules[ ])
A rule contains of a name, a command and an optional description.
The description is generated if none is provided in the pattern of `[<name>] <cmd>`

	{
    	name: string;
    	cmd: string;
    	desc?: string; | '[<name>] <cmd>'
	}

A simple copy rule would look like this:

	rules: [
        { name: 'copy', 'cmd': 'cp $in $out', 'desc': 'copy $in to $out'},
        { name: 'copy-if-notexist', 'cmd': 'cp -n $in $out', 'desc': 'copy $in to $out'}
    ]

This uses ninja-build syntax so use `$in` for input file placement and `$out` for output file placement.

### Edges (edges[ ])
An edge provides a single task for **ethsset**.

	{
    	to: string;
        from: string;
        rule: string;
    }

For a given project structure

	ethsset.json
    bin/
    src/
    raw_assets/
   		default.cfg

A sample rule to copy the `default.cfg` to `bin/` if non-existend in `bin/` would be (according to the rules from above)

	{ 'from': 'raw_assets/some_asset.ast', 'to': 'bin/default.cfg, 'rule': 'copy-if-notexist' }

### GlobEdges (glob_edges[ ])
GlobEdges are another way to define tasks. These task use the [globule](https://www.npmjs.com/package/globule) module and allow to match a single task to a specific file pattern.

	{
        rule: string;
        pattern: string;
        srcBase?: string; | ''
        destBase?: string; | ''
        flatten?: boolean; | false
        ext?: string; | ''
    }

Most of the parameters are named the same as in [globule documentation](https://www.npmjs.com/package/globule).
`rule` is the name of the rule previously defined.

An example globedge is:

        { "pattern": "*.png", "srcBase": "raw_assets", "destBase": "assets", "rule": "copy", "ext": ".picture" }

It copies all png-Files from  `./raw_assets/` to `assets` and changing their file-extension to `.picture`.