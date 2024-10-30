import path from "path";
import fs from "fs";
import { Folder } from "./folder";
import { Entry } from "./entry";


export class File extends Entry<File> {

    static async read(filePath: string, ...pathList: string[]): Promise<string> {
        return await (await File.open(filePath, ...pathList)).read();
    }

    static readSync(filePath: string, ...pathList: string[]): string {
        return File.openSync(filePath, ...pathList).readSync();
    }

    static async open(filePath: string, ...pathList: string[]): Promise<File> {
        const absolute = path.resolve(path.join(filePath, ...pathList));

        if (File.fileInstances[absolute]) {
            return File.fileInstances[absolute];
        }

        const file = new File(absolute);

        File.fileInstances[absolute] = file;

        return await file.init();
    }

    static openSync(filePath: string, ...pathList: string[]): File {
        const absolute = path.resolve(path.join(filePath, ...pathList));

        if (File.fileInstances[absolute]) {
            return File.fileInstances[absolute];
        }

        const file = new File(absolute);

        File.fileInstances[absolute] = file;

        return file.initSync();
    }

    private async init(): Promise<this> {
        await fs.promises.appendFile(this.path, "");

        return this;
    }

    private initSync(): this {
        fs.appendFileSync(this.path, "");

        return this;
    }

    public require<T = any>(): T {
        if (this.extension === 'js') {
            return require(this.path.slice(0, -3)) as T;
        }

        throw new Error("This file cannot be required! File: " + this.path.slice(0, -3));
    }

    public async parseJSON(): Promise<any> {
        if (this.extension === 'json') {
            return JSON.parse(await this.read());
        }

        throw new Error("This file cannot be parsed as JSON!");
    }

    public parseJSONSync(): any {
        if (this.extension === 'json') {
            return JSON.parse(this.readSync());
        }

        throw new Error("This file cannot be parsed as JSON!");
    }


    public async read(): Promise<string> {
        return fs.promises.readFile(this.path, 'utf8');
    }

    public readSync(): string {
        return fs.readFileSync(this.path, 'utf8');
    }

    public async write(text: string) {
        await fs.promises.writeFile(this.path, text);
    }

    public writeSync(text: string) {
        fs.writeFileSync(this.path, text);
    }

    public async append(text: string) {
        await fs.promises.appendFile(this.path, text);
    }

    public appendSync(text: string) {
        fs.appendFileSync(this.path, text);
    }

    public async copy(destPath: string, ...pathList: string[]): Promise<File> {
        const content = await this.read();

        const file = await File.open(path.join(destPath, ...pathList));

        await file.write(content);

        return file;
    }

    public copySync(destPath: string, ...pathList: string[]): File {
        const content = this.readSync();

        const file = File.openSync(path.join(destPath, ...pathList));

        file.writeSync(content);

        return file;
    }


    public get basename(): string {
        return this.name.includes(".") ? this.name.split(".").slice(0, -1).join(".") : this.name;
    }

    public get extension(): string {
        return this.name.includes(".") ? this.name.split(".").pop() as string : "";
    }
}