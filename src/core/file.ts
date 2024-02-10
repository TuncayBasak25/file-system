import path from "path";
import fs from "fs";
import { Folder } from "./folder";
import { Entry } from "./entry";

export class File extends Entry<File> {

    static async open(filePath: string, ...pathList: string[]): Promise<File> {
        const absolute = path.resolve(path.join(filePath, ...pathList));

        if (File.fileInstances[absolute]) {
            return File.fileInstances[absolute];
        }

        const file = new File(absolute);

        File.fileInstances[absolute] = file;

        return await file.init();
    }

    private async init(): Promise<this> {
        await fs.promises.appendFile(this.path, "");

        return this;
    }

    public async require(): Promise<any> {
        if (this.extension === 'js') {
            return require(this.path.slice(0, -3));
        }
        if (this.extension === 'json') {
            return JSON.parse(await this.read());
        }

        throw new Error("This file cannot be required!");
    }


    public async read(): Promise<string> {
        return fs.promises.readFile(this.path, 'utf8');
    }

    public async write(text: string) {
        await fs.promises.writeFile(this.path, text);
    }

    public async append(text: string) {
        await fs.promises.appendFile(this.path, text);
    }

    public async copy(destPath: string, ...pathList: string[]) {
        const content = await this.read();

        const file = await File.open(path.join(destPath, ...pathList));

        await file.write(content);
    }


    public get basename(): string {
        return this.name.includes(".") ? this.name.split(".").slice(0, -1).join(".") : this.name;
    }

    public get extension(): string {
        return this.name.includes(".") ? this.name.split(".").pop() as string : "";
    }
}