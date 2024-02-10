import fs from "fs";
import path from "path";
import { File } from "./file";
import { Entry } from "./entry";

export class Folder extends Entry<File> {

    static async open(folderPath: string, ...pathList: string[]): Promise<Folder> {
        const absolute = path.resolve(path.join(folderPath, ...pathList));

        if (Folder.folderInstances[absolute]) {
            return Folder.folderInstances[absolute];
        }

        const folder = new Folder(absolute);

        Folder.folderInstances[absolute] = folder;

        return await folder.init();
    }

    private async init(): Promise<this> {
        try {
            await fs.promises.opendir(this.path);
        }
        catch (e) {
            await fs.promises.mkdir(this.path);
        }

        return this;
    }
 
    public async openFolder(name: string): Promise<Folder> {
        return Folder.open(this.path, name);
    }
 
    public async openFile(name: string): Promise<File> {
        return File.open(this.path, name);
    }

    public async readFile(name: string): Promise<string> {
        return await (await this.openFile(name)).read();
    }

    //Maybe implement this in the future
    // public async writeFile(name: string, string_or_file: string | File | Promise<File>) {
    //     (await this.openFile(name)).write(string_or_file);
    // }

    // public async appendFile(name: string, string_or_file: string | File | Promise<File>) {
    //     (await this.openFile(name)).append(string_or_file);
    // }

    public async hasFolder(name: string): Promise<Folder | null> {
        return (await this.folderList).find(folder => folder.name === name) || null;
    }

    public async hasFile(name: string): Promise<File | null> {
        return (await this.fileList).find(file => file.name === name) || null;
    }


    private async getEntryList(): Promise<(Folder | File)[]> {
        const entryList = [];

        const directoryHandle = await fs.promises.opendir(this.path);
        
        for await (const entry of await directoryHandle.) {
            if (entry.isDirectory()) {
                entryList.push(await this.openFolder(entry.name));
            }
            else if (entry.isFile()) {
                entryList.push(await this.openFile(entry.name));
            }
        }

        return entryList;
    }

    public get entryList(): Promise<(Folder | File) []> {
        return this.getEntryList();
    }


    private async getFolderList(): Promise<Folder[]> {
        const folderList = [];

        for (const entry of await this.entryList) {
            if (entry instanceof Folder) {
                folderList.push(entry);
            }
        }

        return folderList;
    }

    public get folderList(): Promise<Folder[]> {
        return this.getFolderList();
    }


    private async getFileList(): Promise<File[]> {
        const fileList = [];

        for (const entry of await this.entryList) {
            if (entry instanceof File) {
                fileList.push(entry);
            }
        }

        return fileList;
    }

    public get fileList(): Promise<File[]> {
        return this.getFileList();
    }


    private async getFolders(): Promise<{ [key: string]: Folder }> {
        const folders: { [key: string]: Folder } = {};

        for (const folder of await this.folderList) folders[folder.name] = folder;

        return folders;
    }

    public get folders(): Promise<{ [key: string]: Folder }> {
        return this.getFolders();
    }


    private async getFiles(): Promise<{ [key: string]: File }> {
        const files: { [key: string]: File } = {};

        for (const file of await this.fileList) files[file.name] = file;

        return files;
    }

    public get files(): Promise<{ [key: string]: File }> {
        return this.getFiles();
    }

}