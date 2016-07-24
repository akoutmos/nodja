//Lib imports
let fs = require('fs'),
    child_process = require('child_process'),
    commander = require('commander'),
    glob = require('glob'),
    which = require('which'),
    nodja_config_validator = require('./lib/NodjafileValidator'),
    ninja_builder = require('./lib/NinjafileBuilder.js');

//Exposed module functions
exports.cli = cli;

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
                nodja_config,
                num_build_statements = 0;

            //Validate nodja config
            if (!nodja_config_validator(input_file)) {
                console.error('An error occured! Aborting.');
                process.exit(1);
            }

            //Read in file
            nodja_config = JSON.parse(fs.readFileSync(input_file).toString());

            //Set variable section
            for (let variable in nodja_config.variables) {
                ninja_builder.addVariable(variable, nodja_config.variables[variable]);
            }

            //Set rules section
            for (let rule in nodja_config.rules) {
                ninja_builder.addRule(rule, nodja_config.rules[rule]);
            }

            //Set build statements section and defaults
            num_build_statements = nodja_config.build_statements.length;
            for (let i = 0; i < num_build_statements; i++) {
                let build_statement = nodja_config.build_statements[i];

                //Output has exactly 1 input dependency (1:1)
                if (!glob.hasMagic(build_statement.output) && !glob.hasMagic(build_statement.input)) {
                    ninja_builder.addBuildStatement(build_statement.output, build_statement.rule, build_statement.input);
                }

                //Multiple inputs have been detected via globbing
                else if (!glob.hasMagic(build_statement.output) && glob.hasMagic(build_statement.input)) {
                    let inputs = glob.sync(build_statement.input);

                    ninja_builder.addBuildStatement(build_statement.output, build_statement.rule, inputs);
                }

                //Add build statement to list of defaults if flag set
                if (build_statement.hasOwnProperty('default') && build_statement['default']) {
                    ninja_builder.addDefault(build_statement.output);
                }

                //Add the build statement to list of phony if set
                if (build_statement.hasOwnProperty('phony') && build_statement.phony) {
                    ninja_builder.addPhonyRule(build_statement.phony, build_statement.output);
                }
            }

            //Write out generated ninja build file
            try {
                fs.writeFileSync(output_file_name, ninja_builder.generateNinjaBuild());
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
        .version('0.0.3')
        .parse(args);

    //If no arguments passed in, print help and exit
    if (!commander.args.length){
        commander.help();
    }
}
