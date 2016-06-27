let fs = require('fs');

//Module constants
const templates_path = `${__dirname}/templates`;
const templates = Object.freeze({
    'variable': getFileContents(`${templates_path}/variable`),
    'rule': getFileContents(`${templates_path}/rule`),
    'build_statement': getFileContents(`${templates_path}/build_statement`),
    'default': getFileContents(`${templates_path}/default`),
    'phony': getFileContents(`${templates_path}/phony`),
    'ninja': getFileContents(`${templates_path}/ninja`),
});
const ninja_config = {
    variables: [],
    rules: [],
    build_statements: [],
    defaults: [],
    phony_rules: []
};

//Exposed module functions
exports.addVariable = addVariable;
exports.addRule = addRule;
exports.addBuildStatement = addBuildStatement;
exports.addDefault  = addDefault;
exports.addPhonyRule = addPhonyRule;


exports.getVariables = getVariables;
exports.getRules = getRules;
exports.getBuildStatements = getBuildStatements;
exports.getDefaults = getDefaults;
exports.getPhonyRules = getPhonyRules;

exports.clearAll = clearAll;
exports.generateNinjaBuild = generateNinjaBuild;

function clearAll () {
    ninja_config.variables = [];
    ninja_config.variables = [];
    ninja_config.rules = [];
    ninja_config.build_statements = [];
    ninja_config.defaults = [];
    ninja_config.phony_rules = [];
}

/**
 * addVariable
 *
 * @param name
 * @param value
 * @returns {undefined}
 */
function addVariable (name, value) {
    ninja_config.variables.push({
        name: name,
        value: value
    });
}

function getVariables () {
    return JSON.parse(JSON.stringify(ninja_config.variables));
}

/**
 * addRule
 *
 * @param name
 * @param command
 * @returns {undefined}
 */
function addRule (name, command) {
    ninja_config.rules.push({
        name: name,
        command: command
    });
}

function getRules () {
    return JSON.parse(JSON.stringify(ninja_config.rules));
}

/**
 * addBuildStatement
 *
 * @param output
 * @param rule
 * @param dependencies
 * @returns {undefined}
 */
function addBuildStatement (output, rule, dependencies) {
    ninja_config.build_statements.push({
        output: output,
        rule: rule,
        dependencies: dependencies
    });
}

function getBuildStatements () {
    return JSON.parse(JSON.stringify(ninja_config.build_statements));
}

/**
 * addDefault
 *
 * @param build_statement
 * @returns {undefined}
 */
function addDefault (build_statement) {
    ninja_config.defaults.push({
        build_statement: build_statement
    });
}

function getDefaults () {
    return JSON.parse(JSON.stringify(ninja_config.defaults));
}

/**
 * addPhony
 *
 * @param alias
 * @param output
 * @returns {undefined}
 */
function addPhonyRule (alias, output) {
    ninja_config.phony_rules.push({
        alias: alias,
        output: output
    });
}

function getPhonyRules () {
    return JSON.parse(JSON.stringify(ninja_config.phony_rules));
}

/**
 * Return a string of the ninja build file
 *
 * @returns {String}
 */
function generateNinjaBuild () {

}

/**
 * Returns the contents of a given file synchronously
 *
 * @param path
 * @returns {String}
 */
function getFileContents (path) {
    return fs.readFileSync(path).toString();
}

/**
 * Create a variable assignment entry for ninja config
 *
 * @param name
 * @param value
 * @returns {String}
 */
function generateVariableEntry (name, value) {
    let entry = templates.variable;

    entry = entry.replace('{{name}}', name);
    entry = entry.replace('{{value}}', value);

    return entry;
}

/**
 * Create a rule assignment entry for the ninja config
 *
 * @param rule
 * @param command
 * @returns {undefined}
 */
function generateRuleEntry (rule, command) {
    let entry = templates.rule;

    entry = entry.replace('{{name}}', rule);
    entry = entry.replace('{{command}}', command);

    return entry;
}

/**
 * Create a build statement entry for the ninja config
 *
 * @param output
 * @param rule
 * @param input
 * @returns {String}
 */
function generateBuildStatementEntry (output, rule, input) {
    let entry = templates.build_statement;

    entry = entry.replace('{{output}}', output);
    entry = entry.replace('{{rule}}', rule);
    entry = entry.replace('{{dependencies}}', input);

    return entry;
}

/**
 * Create a default entry statement
 *
 * @param output
 * @returns {String}
 */
function generateDefaultEntry (output) {
    let entry = templates['default'];

    entry = entry.replace('{{build_statement}}', output);

    return entry;
}

/**
 * Create a phony entry statement
 *
 * @param alias
 * @param output
 * @returns {String}
 */
function generatePhonyEntry (alias, output) {
    let entry = templates.phony;

    entry = entry.replace('{{alias}}', alias);
    entry = entry.replace('{{output}}', output);

    return entry;
}

