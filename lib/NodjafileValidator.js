//Lib imports
let fs = require('fs');

//Only expose single validation function
module.exports = validateNodjaConfig;

function NodjaValidationError (message) {
    this.name = 'NodjaValidationError';
    this.message = message;
    this.stack = (new Error()).stack;
}
NodjaValidationError.prototype = Object.create(Error.prototype);
NodjaValidationError.prototype.constructor = NodjaValidationError;

/**
 * Returns whether the file exists or not
 *
 * @param file
 * @returns {Boolean}
 */
function fileExists (file) {
    try {
        fs.accessSync(file, fs.F_OK);
    } catch (err) {
        throw new NodjaValidationError(`Could not read file '${file}'`);
    }

    return true;
}

/**
 * Validates variables section of config
 *
 * @param nodja_config
 * @returns {Boolean}
 */
function validateVariablesSchema (filename, nodja_config) {
    let variable_sets = nodja_config.hasOwnProperty('variable_sets'),
        variables = nodja_config.hasOwnProperty('variables');

    //Check that variables schema is correct
    if (!variable_sets && !variables) {
        throw new NodjaValidationError(`'${filename}' must have either a 'variables' or 'variable_sets' entry`);
    }

    if (variable_sets && variables) {
        throw new NodjaValidationError(`'${filename}' cannot contain both 'variables' and 'variable_sets' entries`);
    }

    if (!variable_sets && variables && typeof nodja_config.variables !== 'object') {
        throw new NodjaValidationError(`\'variables\' entry must be an object`);
    }

    if (variables) {
        for (let variable in nodja_config.variables) {
            if (typeof nodja_config.variables[variable] !== 'string' && !Array.isArray(nodja_config.variables[variable])) {
                throw new NodjaValidationError(`Variable with key \'${variable}\' must be a string or an array of strings`);
            }

            if (Array.isArray(nodja_config.variables[variable])) {
                nodja_config.variables[variable].forEach(function (element, index) {
                    if (typeof element !== 'string') {
                        throw new NodjaValidationError(`Variable array entry index ${index} must be of type string`);
                    }
                });
            }
        }
    }

    if (variable_sets) {
        for (let set in nodja_config.variable_sets) {
            if (typeof nodja_config.variable_sets[set] !== 'object') {
                throw new NodjaValidationError(`Set with key \'${set}\' must be an object`);
            }

            for (let variable in nodja_config.variable_sets[set]) {
                if (typeof nodja_config.variable_sets[set][variable] !== 'string' && !Array.isArray(nodja_config.variable_sets[set][variable])) {
                    throw new NodjaValidationError(`Variable with key \'${variable}\' in variable set '${set}' must be a string or an array of strings`);
                }

                if (Array.isArray(nodja_config.variable_sets[set][variable])) {
                    nodja_config.variable_sets[set][variable].forEach(function (element, index) {
                        if (typeof element !== 'string') {
                            throw new NodjaValidationError(`Variable array entry index ${index} must be of type string`);
                        }
                    });
                }
            }
        }
    }

    //Variables section is valid
    return true;
}

/**
 * Validates rules section of config
 *
 * @param nodja_config
 * @returns {Boolean}
 */
function validateRulesSchema (filename, nodja_config) {
    let rule_sets = nodja_config.hasOwnProperty('rule_sets'),
        rules = nodja_config.hasOwnProperty('rules');

    //Check that rules schema is correct
    if (!rule_sets && !rules) {
        throw new NodjaValidationError(`'${filename}' must have either a 'rules' or 'rule_sets' entry`);
    }

    if (rule_sets && rules) {
        throw new NodjaValidationError(`'${filename}' cannot contain both 'rules' and 'rule_sets' entries`);
    }

    if (!rule_sets && rules && typeof nodja_config.rules !== 'object') {
        throw new NodjaValidationError(`\'rules\' entry must be an object`);
    }

    if (rules) {
        for (let rule in nodja_config.rules) {
            if (typeof nodja_config.rules[rule] !== 'string' && !Array.isArray(nodja_config.rules[rule])) {
                throw new NodjaValidationError(`Rule with key \'${rule}\' must be a string or an array of strings`);
            }

            if (Array.isArray(nodja_config.rules[rule])) {
                nodja_config.rules[rule].forEach(function (element, index) {
                    if (typeof element !== 'string') {
                        throw new NodjaValidationError(`Rule array entry index ${index} must be of type string`);
                    }
                });
            }
        }
    }

    if (rule_sets) {
        for (let set in nodja_config.rule_sets) {
            if (typeof nodja_config.rule_sets[set] !== 'object') {
                throw new NodjaValidationError(`Set with key \'${set}\' must be an object`);
            }

            for (let rule in nodja_config.rule_sets[set]) {
                if (typeof nodja_config.rule_sets[set][rule] !== 'string' && !Array.isArray(nodja_config.rule_sets[set][rule])) {
                    throw new NodjaValidationError(`Rule with key \'${rule}\' in rule set '${set}' must be a string or an array of strings`);
                }

                if (Array.isArray(nodja_config.rule_sets[set][rule])) {
                    nodja_config.rule_sets[set][rule].forEach(function (element, index) {
                        if (typeof element !== 'string') {
                            throw new NodjaValidationError(`Rule array entry index ${index} must be of type string`);
                        }
                    });
                }
            }
        }
    }

    //Rules section is valid
    return true;
}

/**
 * Validates build statements section of config
 *
 * @param nodja_config
 * @returns {Boolean}
 */
function validateBuildStatementsSchema (filename, nodja_config) {
    //Check that build statements schema is correct
    if (!Array.isArray(nodja_config.build_statements)) {
        throw new NodjaValidationError('\'build_statements\' entry must be an array');
    }

    //Loop through all build tasks and ensure that required fields are there and optional field are correct type
    nodja_config.build_statements.forEach(function (element, index) {
        //Required fields check
        if (!element.hasOwnProperty('input')) {
           throw new NodjaValidationError(`Build statement index ${index} must have an input field`);
        }

        if (typeof element.input !== 'string') {
            throw new NodjaValidationError(`Build statement index ${index} must have input field of type string`);
        }

        if (!element.hasOwnProperty('output')) {
           throw new NodjaValidationError(`Build statement index ${index} must have an output field`);
        }

        if (typeof element.output !== 'string') {
            throw new NodjaValidationError(`Build statement index ${index} must have output field of type string`);
        }

        if (!element.hasOwnProperty('rule')) {
           throw new NodjaValidationError(`Build statement index ${index} must have a rule field`);
        }

        if (typeof element.rule !== 'string') {
            throw new NodjaValidationError(`Build statement index ${index} must have rule field of type string`);
        }

        //Optional fields check
        if (element.hasOwnProperty('default') && typeof element.default !== 'boolean') {
            throw new NodjaValidationError(`Build statement index ${index} optional field 'default' must be of type boolean`);
        }

        if (element.hasOwnProperty('phony') && typeof element.phony !== 'string') {
            throw new NodjaValidationError(`Build statement index ${index} optional field 'phony' must be of type string`);
        }

        if (element.hasOwnProperty('opt_input') && typeof element.opt_input !== 'string' && !Array.isArray(element.opt_input)) {
            throw new NodjaValidationError(`Build statement index ${index} optional field 'opt_input' must be a string or an array of strings`);
        }

        if (element.hasOwnProperty('opt_input') && Array.isArray(element.opt_input)) {
            element.opt_input.forEach(function (element, index) {
                if (typeof element !== 'string') {
                    throw new NodjaValidationError(`Optional input array entry index ${index} must be of type string`);
                }
            });
        }

        if (element.hasOwnProperty('opt_output') && typeof element.opt_output !== 'string' && !Array.isArray(element.opt_output)) {
            throw new NodjaValidationError(`Build statement index ${index} optional field 'opt_output' must be a string or an array of strings`);
        }

        if (element.hasOwnProperty('opt_output') && Array.isArray(element.opt_output)) {
            element.opt_output.forEach(function (element, index) {
                if (typeof element !== 'string') {
                    throw new NodjaValidationError(`Optional output array entry index ${index} must be of type string`);
                }
            });
        }
    });

    //Build statements section is valid
    return true;
}

/**
 * Returns whether the provided file is a valid nodja config
 *
 * @param config
 * @returns {Boolean}
 */
function validateNodjaConfig (config) {
    let config_contents,
        nodja_config;

    //Check to make sure file exists
    fileExists(config);

    //Check that it is a valid JSON file
    try {
        config_contents = fs.readFileSync(config).toString();
        nodja_config = JSON.parse(config_contents);
    } catch (err) {
        throw new NodjaValidationError('Nodja configuration is malformed JSON');
    }

    //Run config through various validators and return
    return validateVariablesSchema(config, nodja_config) && validateRulesSchema(config, nodja_config) && validateBuildStatementsSchema(config, nodja_config);
}
