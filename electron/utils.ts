import { PROTOCOL } from './constansts'
import { readFile, writeFile as fsWriteFile, existsSync, readdir as fsReadDir } from 'fs';

import { BrowserWindow } from 'electron';


export function hasProtocol(str: string): boolean {
    return str.indexOf(PROTOCOL) === 0;
}

export function removeProtocol(str: string): string {
    return str.replace(PROTOCOL, '');
}

export function readdir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fsReadDir(path, (error, list) => {
            if (error) {
                reject(error);
            } else {
                resolve(list);
            }
        });
    });
}

export function parseElectronUrl(url: string) {
    const [pathAndSearch, hash] = url.split('#');
    const [path, search] = pathAndSearch.split('?');

    return {
        path,
        search: `?${search || ''}`,
        hash: `#${hash || ''}`
    };
}

export function exist(path: string): Promise<void> {
    const exists = existsSync(path);
    if (exists) {
        return Promise.resolve();
    } else {
        return Promise.reject(new Error(`File with path ${path} does not exist!`));
    }
}

export function read(path: string): Promise<string> {
    return exist(path).then(() => {
        return new Promise<string>((resolve, reject) => {
            readFile(path, 'utf8', (error, file) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(file);
                }
            });
        });
    });
}

export function readJSON(path: string): Promise<object> {
    return read(path).then((file) => JSON.parse(file));
}

export function write(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fsWriteFile(path, content, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function writeJSON(path: string, content: object | Array<object>): Promise<void> {
    return write(path, JSON.stringify(content));
}
