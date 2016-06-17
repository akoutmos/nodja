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
            let run_build = options.run || false,
                output_file = options.output || 'build.ninja';

            //If the build should be executed
            if (run_build) {
                //Check to make sure that the ninja binary is available
                try {
                    which.sync('ninja');
                } catch (err) {
                    console.err('ERROR: ninja binary not found');
                    process.exit(1);
                }

                //Spawn child ninja process, detach and exit successfully
                child_process.spawn('ninja', ['-f', output_file], {
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
