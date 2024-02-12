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
            (await fs.promises.opendir(this.path)).close();
        }
        catch (e) {
            await fs.promises.mkdir(this.path);
        }

        return this;
    }

 
    public async openFolder(...pathList: string[]): Promise<Folder> {
        return Folder.open(this.path, ...pathList);
    }

    public async copy(targetPath: string, exclude: string | string[] = []): Promise<void> {
        const promiseList: Promise<any>[] = [];

        const targetFolder = await Folder.open(targetPath);

        if (typeof exclude === "string") exclude = [exclude];

        for (const entry of (await this.entryList).filter(file => !exclude.includes(file.name))) {
            if (entry instanceof File) promiseList.push(entry.copy(targetFolder.path, entry.name));
            else promiseList.push(entry.copy(path.join(targetFolder.path, entry.name), exclude));
        }

        await Promise.all(promiseList);
    }
 
    public async openFile(...pathList: string[]): Promise<File> {
        return File.open(this.path, ...pathList);
    }

    public async readFile(...pathList: string[]): Promise<string> {
        return await (await this.openFile(...pathList)).read();
    }

    //Maybe implement this in the future
    // public async writeFile(name: string, string_or_file: string | File | Promise<File>) {
    //     (await this.openFile(name)).write(string_or_file);
    // }

    // public async appendFile(name: string, string_or_file: string | File | Promise<File>) {
    //     (await this.openFile(name)).append(string_or_file);
    // }

    /**
     * Returns the first entry found from the entry name list
     */
    public async hasEntry(...nameList: string[]): Promise<Folder | File | null> {
        const file = await this.entryList;

        return (await this.entryList).find(entry => nameList.includes(entry.name)) || null;
    }

    /**
     * Returns the first folder found from the folder name list
     */
    public async hasFolder(...nameList: string[]): Promise<Folder | null> {
        return (await this.folderList).find(folder => nameList.includes(folder.name)) || null;
    }

    /**
     * Returns the first file found from the file name list
     */
    public async hasFile(...nameList: string[]): Promise<File | null> {
        return (await this.fileList).find(file => nameList.includes(file.name)) || null;
    }


    private async getEntryList(): Promise<(Folder | File)[]> {
        const entryList = [];

        const directoryHandle = await fs.promises.opendir(this.path);
        
        for await (const entry of directoryHandle) {
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

    private async getRecursiveFileList(fileList: File[] = []): Promise<File[]> {
        for (const entry of await this.entryList) {
            if (entry instanceof File) {
                fileList.push(entry);
            }
            else if (entry instanceof Folder) {
                await entry.getRecursiveFileList(fileList);
            }
        }

        return fileList;
    }

    public get recursiveFileList(): Promise<File[]> {
        return this.getRecursiveFileList();
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

    

    public async require<T = any>(): Promise<T> {
        const indexFile = await this.hasFile("index.js", this.name + ".js");

        if (indexFile) return await indexFile.require<T>();

        throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
    }
}
