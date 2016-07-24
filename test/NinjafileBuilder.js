let test = require('tap').test;
let builder = require('../lib/NinjafileBuilder.js');
let fs = require('fs');

test('Add config builder and check results', function (t) {
    t.plan(6);

    t.test('Check variables portion of config builder', function (t) {
        //Initial number of variables
        let num_vars = 10;

        //Add varibles to builder
        for (let i = 0; i < num_vars; i++) {
            builder.addVariable('var' + i, 'val' + i);
        }

        //Check length
        t.equal(Object.keys(builder.getVariables()).length, num_vars, 'Expected number of variables post add');

        //Try deleting half the entries
        let variables = builder.getVariables();
        delete variables.var0;
        delete variables.var1;
        delete variables.var2;

        //Check length
        t.equal(Object.keys(builder.getVariables()).length, num_vars, 'Expected number of variables post slice');

        //Check that entry is correct
        t.equal(builder.getVariables().var0.length, 1, 'Expected variable length');
        t.equal(builder.getVariables().var0[0], 'val0', 'Expected variable name');

        //Check that clearing removes all variables
        builder.clearAll();
        t.equal(Object.keys(builder.getVariables()).length, 0, 'Expected no variables');

        t.end();
    });

    t.test('Check rules portion of config builder', function (t) {
        //Initial number of variables
        let num_rules = 10;

        //Add varibles to builder
        for (let i = 0; i < num_rules; i++) {
            builder.addRule('rule' + i, 'command' + i);
        }

        //Check length
        t.equal(Object.keys(builder.getRules()).length, num_rules, 'Expected number of rules post add');

        //Try deleting half the entries
        let rules = builder.getRules();
        delete rules.rule0;
        delete rules.rule1;
        delete rules.rule2;

        //Check length
        t.equal(Object.keys(builder.getRules()).length, num_rules, 'Expected number of rules post slice');

        //Check that entry is correct
        t.equal(builder.getRules().rule0.length, 1, 'Expected rule length');
        t.equal(builder.getRules().rule0[0], 'command0', 'Expected rule command');

        //Check that clearing removes all rules
        builder.clearAll();
        t.equal(Object.keys(builder.getVariables()).length, 0, 'Expected no rules');

        t.end();
    });

    t.test('Check build statements portion of config builder', function (t) {
        //Initial number of variables
        let num_build_statements = 10;

        //Add varibles to builder
        for (let i = 0; i < num_build_statements; i++) {
            builder.addBuildStatement('output' + i, 'rule' + i, 'dependency' + i);
        }

        //Check length
        t.equal(builder.getBuildStatements().length, num_build_statements, 'Expected number of build statements post add');

        //Try deleting half the entries
        builder.getBuildStatements().splice(0, num_build_statements / 2);

        //Check length
        t.equal(builder.getBuildStatements().length, num_build_statements, 'Expected number of build statements post slice');

        //Check that entry is correct
        t.equal(builder.getBuildStatements()[0].output, 'output0', 'Expected build statement output');
        t.equal(builder.getBuildStatements()[0].rule, 'rule0', 'Expected build statement rule');
        t.equal(builder.getBuildStatements()[0].dependencies, 'dependency0', 'Expected build statement dependency');

        //Check that clearing removes all variables
        builder.clearAll();
        t.equal(builder.getBuildStatements().length, 0, 'Expected no build statements');

        t.end();
    });

    t.test('Check defaults portion of config builder', function (t) {
        //Initial number of variables
        let num_defaults = 10;

        //Add varibles to builder
        for (let i = 0; i < num_defaults; i++) {
            builder.addDefault('default' + i);
        }

        //Check length
        t.equal(builder.getDefaults().length, num_defaults, 'Expected number of defaults post add');

        //Try deleting half the entries
        builder.getDefaults().splice(0, num_defaults / 2);

        //Check length
        t.equal(builder.getDefaults().length, num_defaults, 'Expected number of defaults post slice');

        //Check that entry is correct
        t.equal(builder.getDefaults()[0].build_statement, 'default0', 'Expected default build statement');

        //Check that clearing removes all rules
        builder.clearAll();
        t.equal(builder.getDefaults().length, 0, 'Expected no defaults');

        t.end();
    });

    t.test('Check phony portion of config builder', function (t) {
        //Initial number of variables
        let num_phony = 10;

        //Add varibles to builder
        for (let i = 0; i < num_phony; i++) {
            builder.addPhonyRule('alias' + i, 'output' + i);
        }

        //Check length
        t.equal(Object.keys(builder.getPhonyRules()).length, num_phony, 'Expected number of phony rules post add');

        //Try deleting half the entries
        let phony_rules = builder.getPhonyRules();
        delete phony_rules.alias0;
        delete phony_rules.alias1;
        delete phony_rules.alias2;

        //Check length
        t.equal(Object.keys(builder.getPhonyRules()).length, num_phony, 'Expected number of phony rules post slice');

        //Check that entry is correct
        t.equal(builder.getPhonyRules().alias0.length, 1, 'Expected phony rule alias length');
        t.equal(builder.getPhonyRules().alias0[0], 'output0', 'Expected phony rule output');

        //Check that clearing removes all rules
        builder.clearAll();
        t.equal(Object.keys(builder.getPhonyRules()).length, 0, 'Expected no phony rules');

        t.end();
    });

    t.test('Check that generated ninja file is correct', function (t) {
        //Add variables
        builder.addVariable('uglify_flags', '--screwie8 --mangle --compress');

        //Add rules
        builder.addRule('uglifyjs', 'jshint $in && uglifyjs $in --output $out --source-map $out.map ${uglify_flags}');
        builder.addRule('clean', 'rm -rf build');

        //Add build statements
        builder.addBuildStatement('build/test12.min.js', 'uglifyjs', ['test1.js', 'test2.js']);
        builder.addBuildStatement('build/test3.min.js', 'uglifyjs', 'test3.js');
        builder.addBuildStatement('clean', 'clean', '');

        //Add defaults
        builder.addDefault('build/test12.min.js');
        builder.addDefault('build/test3.min.js');

        //Add phony aliases
        builder.addPhonyRule('all', ['build/test12.min.js', 'build/test3.min.js']);

        //Get the resulting ninja file
        t.equal(builder.generateNinjaBuild(), fs.readFileSync(`${__dirname}/ninja_files/ninja_file`).toString(), 'Ninjafile output does not match');

        t.end();
    });

    t.end();
});
