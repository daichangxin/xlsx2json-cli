const fs = require('fs-extra');
const path = require('path');

export function walk(dir: string, handler: (file: string) => any, filter?: (file: string) => boolean) {
    if (!fs.existsSync(dir)) return;
    const stat = fs.statSync(dir);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(dir);
        for (let f of files) {
            walk(path.join(dir, f), handler, filter);
        }
    }
    else if (!filter || filter(dir)) {
        handler(dir);
    }
}

export function getFileName(file: string, withExtension?: boolean) {
    if (!file) return null;
    return path.basename(file, withExtension ? '' : path.extname(file));
}