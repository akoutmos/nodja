let cli = require('commander'),
    glob = require('glob'),
    which = require('which');

cli
    .version('0.0.1')
    .option('-g, --generate <input_file> [output_file]', 'Generate a Ninja build file from the provided nodja config (written to build.ninja if output_file is not provided)')
    .option('-r, --run [task]', 'If provided during --generate, created Ninja file will be executed')
    .option('-c, --check <file>', 'Validate the provided nodja file')
    .option('-h, --help', 'Print this menu')
    .parse(process.argv);
