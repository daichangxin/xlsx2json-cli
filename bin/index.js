#!/usr/bin/env node
(function () {
    'use strict';

    var fs = require('fs-extra');
    var path = require('path');
    function walk(dir, handler, filter) {
        if (!fs.existsSync(dir))
            return;
        var stat = fs.statSync(dir);
        if (stat.isDirectory()) {
            var files = fs.readdirSync(dir);
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var f = files_1[_i];
                walk(path.join(dir, f), handler, filter);
            }
        }
        else if (!filter || filter(dir)) {
            handler(dir);
        }
    }
    function getFileName(file, withExtension) {
        if (!file)
            return null;
        return path.basename(file, withExtension ? '' : path.extname(file));
    }

    var _a = require('xlsx'), readFile = _a.readFile, utils = _a.utils;
    var fs$1 = require('fs-extra');
    var zlib = require('zlib');
    var path$1 = require('path');
    function parse(target, output, compress) {
        console.log('target:', target);
        console.log('output:', output);
        console.log('compress:', compress);
        var configData = {};
        var hasData = false;
        walk(target, function (file) {
            var fileName = getFileName(file);
            configData[fileName] = readXLSX(file);
            hasData = true;
        }, filterXlsx);
        if (!hasData) {
            console.error('提示', '解析失败，检查:\n1 无xlsx文件\n2 xlsx不可使用中文命名');
            return;
        }
        var dir = path$1.dirname(output);
        if (!fs$1.existsSync(dir)) {
            fs$1.mkdirsSync(dir);
        }
        var str_data = JSON.stringify(configData);
        if (compress && (compress !== 'false' && compress !== '0')) {
            var buffer = zlib.deflateSync(str_data);
            fs$1.writeFile(output, buffer, function (err) { });
        }
        else {
            fs$1.writeFile(output, str_data, function (err) { });
        }
        console.log('打包成功, @' + output);
    }
    function filterXlsx(file) {
        return file.endsWith('.xlsx') && file.indexOf('~') === -1;
    }
    function readXLSX(file) {
        var workbook = readFile(file);
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var data = utils.sheet_to_json(worksheet, { raw: true, range: 1 });
        var result = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var item = data_1[_i];
            var hasData = false;
            for (var key in item) {
                if (key.indexOf('__EMPTY') != -1) {
                    delete item[key];
                }
                else {
                    hasData = true;
                }
            }
            if (hasData) {
                result.push(item);
            }
        }
        return result;
    }

    var program = require('commander');
    var path$2 = require('path');
    program
        .version('1.0.0', '-v, --version');
    program
        .command('build <target [o] [compress]')
        .description('build xlsx files to json')
        .option('-t, --target', 'xlsx文件、xlsx文件夹、xlsx配置文件(xml)')
        .option('-o, --output', '导出路径，默认为相对 target 目录: output/config.json')
        .option('-c, --compress', '是否使用zlib压缩')
        .action(function (target, output, compress) {
        if (!output) {
            output = path$2.resolve(target, 'output/config.json');
        }
        parse(target, output, compress);
    });
    program.parse(process.argv);

}());
