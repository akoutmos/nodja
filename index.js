let fs = require('fs'),
    child_process = require('child_process'),
    commander = require('commander'),
    glob = require('glob'),
    which = require('which');

//Exposed module functions
exports.cli = cli;

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
 * Returns whether the file exists or not
 *
 * @param file
 * @returns {Boolean}
 */
function fileExists (file) {
    try {
        fs.accessSync(file, fs.F_OK);
    } catch (err) {
        return false;
    }

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
    if (!fileExists(config)) {
        console.error(`ERROR: Could not find '${config}'`);
        return false;
    }

    //Check that it is a valid JSON file
    try {
        config_contents = fs.readFileSync(config).toString();
        nodja_config = JSON.parse(config_contents);
    } catch (err) {
        console.error('ERROR: Nodja configuration is malformed JSON');
        return false;
    }

    //Check that the schema is correct
    if (typeof nodja_config.variables !== 'object') {
        console.error('ERROR: \'variables\' entry must be an object');
        return false;
    }

    if (typeof nodja_config.rules !== 'object') {
        console.error('ERROR: \'rules\' entry must be an object');
        return false;
    }

    if (!Array.isArray(nodja_config.build_statements)) {
        console.error('ERROR: \'build_statements\' entry must be an array');
        return false;
    }

    //If we got here, it is valid
    return true;
}

/**
 * The cli entry point
 *
 * @param args the command line arguments
 */
function cli (args) {
    //Get ninja templates
    let templates_path = `${__dirname}/templates`,
        templates = Object.freeze({
            'build_statement': getFileContents(`${templates_path}/build_statement`),
            'default': getFileContents(`${templates_path}/default`),
            'ninja': getFileContents(`${templates_path}/ninja`),
            'rule': getFileContents(`${templates_path}/rule`),
            'variable': getFileContents(`${templates_path}/variable`)
        });

    //Configure CLI options via commander
    commander
        .command('generate <input_file>')
        .alias('g')
        .description('generate a ninja build file from the provided nodja config (written to build.ninja if output_file is not provided)')
        .option('--output <output_file>', 'where to write the output ninja file to')
        .option('--run', 'if provided, created ninja file will be executed')
        .action(function (input_file, options) {
            //Set option defaults if none provided and get base ninja template
            let run_build = options.run || false,
                output_file_name = options.output || 'build.ninja',
                output_ninja_file = templates.ninja,
                nodja_config,
                variable_section = '',
                rule_section = '';

            //Validate nodja config
            if ( !validateNodjaConfig(input_file)) {
                console.error('An error occured! Aborting.');
                process.exit(1);
            }

            //Read in file
            nodja_config = JSON.parse(fs.readFileSync(input_file).toString());

            //Set variable section
            for (let variable in nodja_config.variables) {
                let entry = templates.variable;
                entry = entry.replace('{{name}}', variable);
                entry = entry.replace('{{value}}', nodja_config.variables[variable]);

                variable_section += entry;
            }
            output_ninja_file = output_ninja_file.replace('{{variables}}', variable_section);

            //Set rules section
            for (let rule in nodja_config.rules) {
                let entry = templates.rule;
                entry = entry.replace('{{name}}', rule);
                entry = entry.replace('{{command}}', nodja_config.rules[rule]);

                rule_section += entry;
            }
            output_ninja_file = output_ninja_file.replace('{{rules}}', rule_section);


            //Set build statements section


            //Write out generated ninja build file
            try {
                fs.writeFileSync(output_file_name, output_ninja_file);
            } catch (err) {
                console.error(`ERROR: Could not write to '${output_file_name}'`);
                process.exit(1);
            }

            //If the build should be executed
            if (run_build) {
                //Check to make sure that the ninja binary is available
                try {
                    which.sync('ninja');
                } catch (err) {
                    console.error('ERROR: ninja binary not found');
                    process.exit(1);
                }

                //Spawn child ninja process, detach and exit successfully
                child_process.spawn('ninja', ['-f', output_file_name], {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'inherit',
                    detached: true
                }).unref();
                process.exit(0);
            }
        });

    commander
        .command('check <input_file>')
        .alias('c')
        .description('validate the provided nodja build file')
        .action(function (input_file) {

        });

    commander
        .version('0.0.2')
        .parse(args);

    //If no arguments passed in, print help and exit
    if (!commander.args.length){
        commander.help();
    }
}
