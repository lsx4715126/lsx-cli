import program from 'commander';
import { VERSION } from './utils/constants';
import apply from './index';
import chalk from 'chalk';

/**
 * lsx commands
 *    - config
 *    - create 
 */

let actionMap = {
    create: {
        alias: 'c',
        description: 'generate a new project from a template',
        usages: [
            'lsx-cli create templateName projectName'
        ]
    },
    config: {
        alias: 'cfg',
        description: 'config .lsxrc',
        usages: [
            'lsx-cli config set <k> <v>',
            'lsx-cli config get <k>',
            'lsx-cli config remove <k>'
        ]
        
    },
    //other commands
}

// 添加 create / config 命令
Object.keys(actionMap).forEach((action) => {
    let description = actionMap[action].description ? actionMap[action].description : 'description'
    let alias = actionMap[action].alias ? actionMap[action].alias : 'alias'

    program.command(action)
    .description(description)
    .alias(alias) //别名
    .action(() => {
        switch (action) {
            case 'config': 
                //配置
                apply(action, ...process.argv.slice(3));
                break;
            case 'create':
                apply(action, ...process.argv.slice(3));
                break;
            default:
                break;
        }
    });
});

function help() {
    console.log('\r\nUsage:');
    Object.keys(actionMap).forEach((action) => {
        actionMap[action].usages.forEach(usage => {
            console.log('  - ' + usage);
        });
    });
    console.log('\r');
}
program.usage('<command> [options]');
// lsx-cli -h 
program.on('-h', help);
program.on('--help', help);
// lsx-cli -V   VERSION 为 package.json 中的版本号
program.version(VERSION, '-V --version').parse(process.argv);

// lsx-cli 不带参数时
if (!process.argv.slice(2).length) {
    program.outputHelp(make_green);
}
function make_green(txt) {
    return chalk.green(txt); 
}
