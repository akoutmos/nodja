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
    //Check that variables schema is correct
    if (!nodja_config.hasOwnProperty('variable_sets') && !nodja_config.hasOwnProperty('variables')) {
        throw new NodjaValidationError(`'${filename}' must have either a 'variables' or 'variable_sets' entry`);
    }

    if (nodja_config.hasOwnProperty('variable_sets') && nodja_config.hasOwnProperty('variables')) {
        throw new NodjaValidationError(`'${filename}' cannot contain both 'variables' and 'variable_sets' entries`);
    }

    if (!nodja_config.hasOwnProperty('variable_sets') && nodja_config.hasOwnProperty('variables') && typeof nodja_config.variables !== 'object') {
        throw new NodjaValidationError(`\'variables\' entry must be an object`);
    }

    if (nodja_config.hasOwnProperty('variables')) {
        for (let variable in nodja_config.variables) {
            if (typeof nodja_config.variables[variable] !== 'string') {
                throw new NodjaValidationError(`Variable with key \'${variable}\' must be a string`);
            }
        }
    }

    if (nodja_config.hasOwnProperty('variable_sets')) {
        for (let set in nodja_config.variable_sets) {
            if (typeof nodja_config.variable_sets[set] !== 'object') {
                throw new NodjaValidationError(`Set with key \'${set}\' must be an object`);
            }

            for (let variable in nodja_config.variable_sets[set]) {
                if (typeof nodja_config.variable_sets[set][variable] !== 'string') {
                    throw new NodjaValidationError(`Variable with key \'${variable}\' in variable set '${set}' must be a string`);
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
function validateRulesSchema (nodja_config) {
    //Check that rules schema is correct
    if (!nodja_config.hasOwnProperty('rules') && nodja_config.hasOwnProperty('rules') && typeof nodja_config.rules !== 'object') {
        throw new NodjaValidationError('\'rules\' entry must be an object');
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
function validateBuildStatementsSchema (nodja_config) {
    //Check that build statements schema is correct
    if (!Array.isArray(nodja_config.build_statements)) {
        throw new NodjaValidationError('\'build_statements\' entry must be an array');
    }

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
