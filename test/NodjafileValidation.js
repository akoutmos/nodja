let test = require('tap').test;
let validator = require('../lib/NodjafileValidator');

test('File validator', function (t) {
    t.plan(2);

    t.test('File does not exist', function (t) {
        t.throws(function () {
            validator('UNKOWN_FILE');
        }, { message: `Could not read file 'UNKOWN_FILE'` });

        t.end();
    });

    t.test('Invalid Json file', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidJson.json`);
        }, { message: 'Nodja configuration is malformed JSON' });

        t.end();
    });

    t.end();
});

test('Variable schema', function (t) {
    t.plan(8);

    t.test('Config does not contain variable section', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/validJson.json`);
        }, { message: /.*must have either a 'variables' or 'variable_sets' entry/ });

        t.end();
    });

    t.test('Config contains both variables and variable_sets sections', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/bothVariableSections.json`);
        }, { message: /.*cannot contain both 'variables' and 'variable_sets' entries/ });

        t.end();
    });

    t.test('Invalid variables section', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableSection.json`);
        }, { message: /.*\'variables\' entry must be an object/ });

        t.end();
    });

    t.test('Invalid variable assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableAssignments.json`);
        }, { message: /Variable with key \'.*\' must be a string or an array of strings/ });

        t.end();
    });

    t.test('Invalid variable array assignment', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableArrayAssignment.json`);
        }, { message: /Variable array entry index .* must be of type string/ });

        t.end();
    });

    t.test('Invalid variable_sets assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableSetsAssignments.json`);
        }, { message: /Set with key \'.*\' must be an object/ });

        t.end();
    });

    t.test('Invalid variable_sets variable assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableSetsVariableAssignments.json`);
        }, { message: /Variable with key \'.*\' in variable set \'.*\' must be a string or an array of strings/ });

        t.end();
    });

    t.test('Invalid variable_sets variable array assignment', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableSetsVariableArrayAssignment.json`);
        }, { message: /Variable array entry index .* must be of type string/ });

        t.end();
    });

    t.end();
});

test('Rule schema', function (t) {
    t.plan(8);

    t.test('Config does not contain rule section', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/validVariables.json`);
        }, { message: /.*must have either a 'rules' or 'rule_sets' entry/ });

        t.end();
    });

    t.test('Config contains both rules and rule_sets sections', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/bothRuleSections.json`);
        }, { message: /.*cannot contain both 'rules' and 'rule_sets' entries/ });

        t.end();
    });

    t.test('Invalid rules section', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleSection.json`);
        }, { message: /.*\'rules\' entry must be an object/ });

        t.end();
    });

    t.test('Invalid rule assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleAssignments.json`);
        }, { message: /Rule with key \'.*\' must be a string or an array of strings/ });

        t.end();
    });

    t.test('Invalid rule aray assignment', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleArrayAssignment.json`);
        }, { message: /Rule array entry index .* must be of type string/ });

        t.end();
    });

    t.test('Invalid rule_sets assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleSetsAssignments.json`);
        }, { message: /Set with key \'.*\' must be an object/ });

        t.end();
    });

    t.test('Invalid rule_sets rule assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleSetsRuleAssignments.json`);
        }, { message: /Rule with key \'.*\' in rule set \'.*\' must be a string or an array of strings/ });

        t.end();
    });

    t.test('Invalid rule_sets rule array assignment', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidRuleSetsRuleArrayAssignment.json`);
        }, { message: /Rule array entry index .* must be of type string/ });

        t.end();
    });

    t.end();
});

test('Build statement schema', function (t) {
    t.plan(9);

    t.test('Invalid build statement', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatement.json`);
        }, { message: /\'build_statements\' entry must be an array/ });

        t.end();
    });

    t.test('Invalid build statement no input field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementNoInput.json`);
        }, { message: /Build statement index .* must have an input field/ });

        t.end();
    });

    t.test('Invalid build statement wrong input field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementWrongInput.json`);
        }, { message: /Build statement index .* must have input field of type string/ });

        t.end();
    });

    t.test('Invalid build statement no output field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementNoOutput.json`);
        }, { message: /Build statement index .* must have an output field/ });

        t.end();
    });

    t.test('Invalid build statement wrong output field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementWrongOutput.json`);
        }, { message: /Build statement index .* must have output field of type string/ });

        t.end();
    });

    t.test('Invalid build statement no rule field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementNoRule.json`);
        }, { message: /Build statement index .* must have a rule field/ });

        t.end();
    });

    t.test('Invalid build statement wrong rule field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementWrongRule.json`);
        }, { message: /Build statement index .* must have rule field of type string/ });

        t.end();
    });

    t.test('Invalid build statement wrong default field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementWrongDefault.json`);
        }, { message: /Build statement index .* optional field \'default\' must be of type boolean/ });

        t.end();
    });

    t.test('Invalid build statement wrong phony field', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidBuildStatementWrongPhony.json`);
        }, { message: /Build statement index .* optional field \'phony\' must be of type string/ });

        t.end();
    });

    t.end();
});

test('Valid Nodja file', function (t) {
    t.plan(1);

    t.doesNotThrow(function () {
        validator(`${__dirname}/configs/validNodjaFile.json`);
    });
});
