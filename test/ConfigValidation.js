let test = require("tap").test;
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
    t.plan(6);

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

    t.test('Invalid variable section', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableSection.json`);
        }, { message: /.*\'variables\' entry must be an object/ });

        t.end();
    });

    t.test('Invalid variable assignments', function (t) {
        t.throws(function () {
            validator(`${__dirname}/configs/invalidVariableAssignments.json`);
        }, { message: /Variable with key \'.*\' must be a string/ });

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
        }, { message: /Variable with key \'.*\' in variable set \'.*\' must be a string/ });

        t.end();
    });

    t.end();
});

test('Rule schema');

test('Build statement schema');

