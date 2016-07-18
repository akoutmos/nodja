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
    default_build_statements: [],
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

/**
 * Clears all stored ninja elements
 */
function clearAll () {
    ninja_config.variables = [];
    ninja_config.rules = [];
    ninja_config.build_statements = [];
    ninja_config.default_build_statements = [];
    ninja_config.phony_rules = [];
}

/**
 * Add variable to variables array
 *
 * @param name
 * @param value
 */
function addVariable (name, value) {
    ninja_config.variables.push({
        name: name,
        value: value
    });
}

/**
 * Get stored variables
 */
function getVariables () {
    return JSON.parse(JSON.stringify(ninja_config.variables));
}

/**
 * Add rule to rules array
 *
 * @param name
 * @param command
 */
function addRule (name, command) {
    ninja_config.rules.push({
        name: name,
        command: command
    });
}

/**
 * Get the stored rules
 */
function getRules () {
    return JSON.parse(JSON.stringify(ninja_config.rules));
}

/**
 * Add build statement to build statements array
 *
 * @param output
 * @param rule
 * @param dependencies
 */
function addBuildStatement (output, rule, dependencies) {
    ninja_config.build_statements.push({
        output: output,
        rule: rule,
        dependencies: Array.isArray(dependencies) ? dependencies.join(' ') : dependencies
    });
}

/**
 * Get the stored build statements
 */
function getBuildStatements () {
    return JSON.parse(JSON.stringify(ninja_config.build_statements));
}

/**
 * Add default to defaults array
 *
 * @param build_statement
 */
function addDefault (build_statement) {
    ninja_config.default_build_statements.push({
        build_statement: build_statement
    });
}

/**
 * Get the stored defaults
 */
function getDefaults () {
    return JSON.parse(JSON.stringify(ninja_config.default_build_statements));
}

/**
 * Add phony rule to phony rules array
 *
 * @param alias
 * @param output
 */
function addPhonyRule (alias, output) {
    ninja_config.phony_rules.push({
        alias: alias,
        output: Array.isArray(output) ? output.join(' ') : output
    });
}

/**
 * Get the stored phony rules
 *
 * @returns {undefined}
 */
function getPhonyRules () {
    return JSON.parse(JSON.stringify(ninja_config.phony_rules));
}

/**
 * Return a string of the ninja build file
 *
 * @returns {String}
 */
function generateNinjaBuild () {
    let output_ninja_file = templates.ninja,
        variables_section = [],
        rules_section = [],
        build_statements_section = [],
        default_build_statements = [],
        phony_section = [];

    //Aggregate sections
    ninja_config.variables.forEach(function (variable) {
        variables_section.push(generateVariableEntry(variable));
    });

    ninja_config.rules.forEach(function (rule) {
        rules_section.push(generateRuleEntry(rule));
    });

    ninja_config.build_statements.forEach(function (build_statement) {
        build_statements_section.push(generateBuildStatementEntry(build_statement));
    });

    ninja_config.default_build_statements.forEach(function (default_entry) {
        default_build_statements.push(generateDefaultEntry(default_entry));
    });

    ninja_config.phony_rules.forEach(function (phony) {
        phony_section.push(generatePhonyEntry(phony));
    });

    //Build ninja file with sections
    output_ninja_file = output_ninja_file.replace('{{variables}}', variables_section.join('\n'));
    output_ninja_file = output_ninja_file.replace('{{rules}}', rules_section.join('\n'));
    output_ninja_file = output_ninja_file.replace('{{build_statements}}', build_statements_section.join('\n'));
    output_ninja_file = output_ninja_file.replace('{{defaults}}', default_build_statements.join('\n'));
    output_ninja_file = output_ninja_file.replace('{{phony_aliases}}', phony_section.join('\n'));

    return output_ninja_file;
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
function generateVariableEntry (variable) {
    let entry = templates.variable;

    entry = entry.replace('{{name}}', variable.name);
    entry = entry.replace('{{value}}', variable.value);

    return entry;
}

/**
 * Create a rule assignment entry for the ninja config
 *
 * @param rule
 * @param command
 * @returns {String}
 */
function generateRuleEntry (rule) {
    let entry = templates.rule;

    entry = entry.replace('{{name}}', rule.name);
    entry = entry.replace('{{command}}', rule.command);

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
function generateBuildStatementEntry (build_statement) {
    let entry = templates.build_statement;

    entry = entry.replace('{{output}}', build_statement.output);
    entry = entry.replace('{{rule}}', build_statement.rule);
    entry = entry.replace('{{dependencies}}', build_statement.dependencies);

    return entry;
}

/**
 * Create a default entry statement
 *
 * @param output
 * @returns {String}
 */
function generateDefaultEntry (default_entry) {
    let entry = templates['default'];

    entry = entry.replace('{{build_statement}}', default_entry.build_statement);

    return entry;
}

/**
 * Create a phony entry statement
 *
 * @param alias
 * @param output
 * @returns {String}
 */
function generatePhonyEntry (phony) {
    let entry = templates.phony;

    entry = entry.replace('{{alias}}', phony.alias);
    entry = entry.replace('{{output}}', phony.output);

    return entry;
}

