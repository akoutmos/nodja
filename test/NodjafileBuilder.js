let test = require('tap').test;
let builder = require('../lib/NodjafileBuilder.js');

test('Add config builder and check results', function (t) {
    t.plan(5);

    t.test('Check variables portion of config builder', function (t) {
        //Initial number of variables
        let num_vars = 10;

        //Add varibles to builder
        for (let i = 0; i < num_vars; i++) {
            builder.addVariable('var' + i, 'val' + i);
        }

        //Check length
        t.equal(builder.getVariables().length, num_vars, 'Expected number of variables post add');

        //Try deleting half the entries
        builder.getVariables().splice(0, num_vars / 2);

        //Check length
        t.equal(builder.getVariables().length, num_vars, 'Expected number of variables post slice');

        //Check that entry is correct
        t.equal(builder.getVariables()[0].name, 'var0', 'Expected variable name');
        t.equal(builder.getVariables()[0].value, 'val0', 'Expected variable value');

        //Check that clearing removes all variables
        builder.clearAll();
        t.equal(builder.getVariables().length, 0, 'Expected no variables');

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
        t.equal(builder.getRules().length, num_rules, 'Expected number of rules post add');

        //Try deleting half the entries
        builder.getRules().splice(0, num_rules / 2);

        //Check length
        t.equal(builder.getRules().length, num_rules, 'Expected number of rules post slice');

        //Check that entry is correct
        t.equal(builder.getRules()[0].name, 'rule0', 'Expected rule name');
        t.equal(builder.getRules()[0].command, 'command0', 'Expected rule command');

        //Check that clearing removes all rules
        builder.clearAll();
        t.equal(builder.getRules().length, 0, 'Expected no rules');

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
        t.equal(builder.getPhonyRules().length, num_phony, 'Expected number of phony rules post add');

        //Try deleting half the entries
        builder.getPhonyRules().splice(0, num_phony / 2);

        //Check length
        t.equal(builder.getPhonyRules().length, num_phony, 'Expected number of phony rules post slice');

        //Check that entry is correct
        t.equal(builder.getPhonyRules()[0].alias, 'alias0', 'Expected phony rule alias');
        t.equal(builder.getPhonyRules()[0].output, 'output0', 'Expected phony rule output');

        //Check that clearing removes all rules
        builder.clearAll();
        t.equal(builder.getPhonyRules().length, 0, 'Expected no phony rules');

        t.end();
    });

    t.end();
});
