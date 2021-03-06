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
    variables: {},
    rules: {},
    build_statements: [],
    default_build_statements: [],
    phony_rules: {}
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
    ninja_config.variables = {};
    ninja_config.rules = {};
    ninja_config.build_statements = [];
    ninja_config.default_build_statements = [];
    ninja_config.phony_rules = {};
}

/**
 * Add variable to variables array
 *
 * @param name
 * @param value
 */
function addVariable (name, value) {
    if (!ninja_config.variables.hasOwnProperty(name)) {
        ninja_config.variables[name] = [];
    }

    ninja_config.variables[name] = ninja_config.variables[name].concat(value);
}

/**
 * Get stored variables
 *
 * @returns {Object}
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
    if (!ninja_config.rules.hasOwnProperty(name)) {
        ninja_config.rules[name] = [];
    }

    ninja_config.rules[name] = ninja_config.rules[name].concat(command);
}

/**
 * Get the stored rules
 *
 * @returns {Object}
 */
function getRules () {
    return JSON.parse(JSON.stringify(ninja_config.rules));
}

/**
 * Add build statement to build statements array
 *
 * @param output
 * @param rule
 * @param input
 * @param opt_input
 * @param opt_output
 */
function addBuildStatement (output, rule, input, opt_input = "", opt_output = "") {
    ninja_config.build_statements.push({
        output: output,
        opt_output: Array.isArray(opt_output) ? opt_output.join(' ') : opt_output,
        rule: rule,
        input: Array.isArray(input) ? input.join(' ') : input,
        opt_input: Array.isArray(opt_input) ? opt_input.join(' ') : opt_input,
    });
}

/**
 * Get the stored build statements
 *
 * @returns {Object}
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
 *
 * @returns {Object}
 */
function getDefaults () {
    return JSON.parse(JSON.stringify(ninja_config.default_build_statements));
}

/**
 * Add phony rule to phony rules array
 *
 * @param alias
 * @param output_file
 */
function addPhonyRule (alias, output_file) {
    if (!ninja_config.phony_rules.hasOwnProperty(alias)) {
        ninja_config.phony_rules[alias] = [];
    }

    ninja_config.phony_rules[alias] = ninja_config.phony_rules[alias].concat(output_file);
}

/**
 * Get the stored phony rules
 *
 * @returns {Object}
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
    for (let variable in ninja_config.variables) {
        variables_section.push(generateVariableEntry({
            name: variable,
            value: ninja_config.variables[variable].join(' ')
        }));
    }

    for (let rule in ninja_config.rules) {
        rules_section.push(generateRuleEntry({
            name: rule,
            command: ninja_config.rules[rule].join(' && ')
        }));
    }

    ninja_config.build_statements.forEach(function (build_statement) {
        build_statements_section.push(generateBuildStatementEntry(build_statement));
    });

    ninja_config.default_build_statements.forEach(function (default_entry) {
        default_build_statements.push(generateDefaultEntry(default_entry));
    });

    for (let phony in ninja_config.phony_rules) {
        phony_section.push(generatePhonyEntry({
            alias: phony,
            output: ninja_config.phony_rules[phony].join(' ')
        }));
    }

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
 * @param variable
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
 * @param build_statement
 * @returns {String}
 */
function generateBuildStatementEntry (build_statement) {
    let entry = templates.build_statement;

    entry = entry.replace('{{explicit_output}}', build_statement.output);
    entry = entry.replace('{{implicit_output}}', build_statement.opt_output);
    entry = entry.replace('{{rule}}', build_statement.rule);
    entry = entry.replace('{{explicit_dependencies}}', build_statement.input);
    entry = entry.replace('{{implicit_dependencies}}', build_statement.opt_input);

    return entry;
}

/**
 * Create a default entry statement
 *
 * @param default_entry
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
 * @param phony
 * @returns {String}
 */
function generatePhonyEntry (phony) {
    let entry = templates.phony;

    entry = entry.replace('{{alias}}', phony.alias);
    entry = entry.replace('{{output}}', phony.output);

    return entry;
}

