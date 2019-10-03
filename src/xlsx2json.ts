const { readFile, utils } = require('xlsx');
import { getFileName, walk } from './fileUtils';
const fs = require('fs-extra');
const zlib = require('zlib');
const path = require('path');

export function parse(target: string, output: string, compress?: string) {
    console.log('target:', target);
    console.log('output:', output);
    console.log('compress:', compress);
    const configData: any = {};
    let hasData = false;
    walk(target, (file: string) => {
        const fileName = getFileName(file);
        configData[fileName] = readXLSX(file);
        hasData = true;
    }, filterXlsx);

    if (!hasData) {
        console.error('提示', '解析失败，检查:\n1 无xlsx文件\n2 xlsx不可使用中文命名');
        return
    }

    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) {
        fs.mkdirsSync(dir);
    }

    const str_data = JSON.stringify(configData);
    if (compress && (compress !== 'false' && compress !== '0')) {
        const buffer: Buffer = zlib.deflateSync(str_data);
        fs.writeFile(output, buffer, (err: any) => { });
    } else {
        fs.writeFile(output, str_data, (err: any) => { });
    }
    console.log('打包成功, @' + output);
}

function filterXlsx(file: string) {
    return file.endsWith('.xlsx') && file.indexOf('~') === -1;
}

function readXLSX(file: string) {
    const workbook = readFile(file);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = utils.sheet_to_json(worksheet, { raw: true, range: 1 });
    //删除空键
    const result: any[] = [];
    for (let item of data) {
        //判断并删除空数据的对象
        let hasData = false;
        for (let key in item) {
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
