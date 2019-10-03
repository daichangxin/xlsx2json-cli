const program = require('commander');
const path = require('path');
import { parse } from './xlsx2json';

program
    .version('1.0.0', '-v, --version');

program
    .command('build <target [o] [compress]')
    .description('build xlsx files to json')
    .option('-t, --target', 'xlsx文件、xlsx文件夹、xlsx配置文件(xml)')
    .option('-o, --output', '导出路径，默认为相对 target 目录: output/config.json')
    .option('-c, --compress', '是否使用zlib压缩')
    .action((target: string, output: string, compress: boolean) => {
        if (!output) {
            output = path.resolve(target, 'output/config.json');
        }
        parse(target, output, compress);
    });

program.parse(process.argv);