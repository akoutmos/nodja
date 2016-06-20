//Lib imports
let fs = require('fs'),
    child_process = require('child_process'),
    commander = require('commander'),
    glob = require('glob'),
    which = require('which'),
    nodja_config_validator = require('./lib/NodjafileValidator');


//Module constants
const templates_path = `${__dirname}/templates`;
const templates = Object.freeze({
    'build_statement': getFileContents(`${templates_path}/build_statement`),
    'default': getFileContents(`${templates_path}/default`),
    'ninja': getFileContents(`${templates_path}/ninja`),
    'rule': getFileContents(`${templates_path}/rule`),
    'variable': getFileContents(`${templates_path}/variable`)
});


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

function generatePhonyEntry () {

}

/**
 * The cli entry point
 *
 * @param args the command line arguments
 */
function cli (args) {
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
                num_build_statements = 0,
                variable_section = [],
                rule_section = [],
                build_statement_section = [],
                default_build_statements = [];

            //Validate nodja config
            if (!nodja_config_validator(input_file)) {
                console.error('An error occured! Aborting.');
                process.exit(1);
            }

            //Read in file
            nodja_config = JSON.parse(fs.readFileSync(input_file).toString());

            //Set variable section
            for (let variable in nodja_config.variables) {
                variable_section.push(
                    generateVariableEntry(variable, nodja_config.variables[variable])
                );
            }


            //Set rules section
            for (let rule in nodja_config.rules) {
                rule_section.push(
                    generateRuleEntry(rule, nodja_config.rules[rule])
                );
            }





            //Set build statements section and defaults
            num_build_statements = nodja_config.build_statements.length;
            for (let i = 0; i < num_build_statements; i++) {
                let entry = templates.build_statement,
                    build_statement = nodja_config.build_statements[i];

                //Output has exactly 1 input dependency (1:1)
                if (!glob.hasMagic(build_statement.output) && !glob.hasMagic(build_statement.input)) {
                    //Append resulting build step
                    build_statement_section.push(
                        generateBuildStatementEntry(build_statement.output, build_statement.rule, build_statement.input)
                    );
                }

                //Multiple inputs have been detected via globbing
                else if (!glob.hasMagic(build_statement.output) && glob.hasMagic(build_statement.input)) {
                    let inputs = glob.sync(build_statement.input);

                    //Append resulting build step
                    build_statement_section.push(
                        generateBuildStatementEntry(build_statement.output, build_statement.rule, inputs.join(' '))
                    );
                }

                //Add build statement to list of defaults if flag set
                if (build_statement.hasOwnProperty('default') && build_statement['default']) {
                    default_build_statements.push(
                        generateDefaultEntry(build_statement.output)
                    );
                }
            }


            //TODO: Set phony statements section


            //Set all aggregated sections
            output_ninja_file = output_ninja_file.replace('{{variables}}', variable_section.join('\n'));
            output_ninja_file = output_ninja_file.replace('{{rules}}', rule_section.join('\n'));
            output_ninja_file = output_ninja_file.replace('{{build_statements}}', build_statement_section.join('\n'));
            output_ninja_file = output_ninja_file.replace('{{defaults}}', default_build_statements.join('\n'));

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
                let ninja = child_process.spawnSync('ninja', ['-f', output_file_name], {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'inherit'
                });

                //Return the ninja process exit code
                process.exit(ninja.status);
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
