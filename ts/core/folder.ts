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

    static openSync(folderPath: string, ...pathList: string[]): Folder {
        const absolute = path.resolve(path.join(folderPath, ...pathList));

        if (Folder.folderInstances[absolute]) {
            return Folder.folderInstances[absolute];
        }

        const folder = new Folder(absolute);

        Folder.folderInstances[absolute] = folder;

        return folder.initSync();
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

    private initSync(): this {
        try {
            fs.opendirSync(this.path).close();
        }
        catch (e) {
            fs.mkdirSync(this.path);
        }

        return this;
    }

 
    public async openFolder(...pathList: string[]): Promise<Folder> {
        return Folder.open(this.path, ...pathList);
    }
 
    public openFolderSync(...pathList: string[]): Folder {
        return Folder.openSync(this.path, ...pathList);
    }

    public async copy(targetPath: string, exclude: string | string[] = []): Promise<Folder> {
        const promiseList: Promise<any>[] = [];

        const targetFolder = await Folder.open(targetPath);

        if (typeof exclude === "string") exclude = [exclude];

        for (const entry of (await this.entryList).filter(file => !exclude.includes(file.name))) {
            if (entry instanceof File) promiseList.push(entry.copy(targetFolder.path, entry.name));
            else promiseList.push(entry.copy(path.join(targetFolder.path, entry.name), exclude));
        }

        await Promise.all(promiseList);

        return targetFolder;
    }

    public copySync(targetPath: string, exclude: string | string[] = []): Folder {
        const targetFolder = Folder.openSync(targetPath);

        if (typeof exclude === "string") exclude = [exclude];

        for (const entry of this.entryListSync.filter(file => !exclude.includes(file.name))) {
            if (entry instanceof File) entry.copySync(targetFolder.path, entry.name);
            else entry.copySync(path.join(targetFolder.path, entry.name), exclude);
        }

        return targetFolder;
    }
 
    public async openFile(...pathList: string[]): Promise<File> {
        return File.open(this.path, ...pathList);
    }
 
    public openFileSync(...pathList: string[]): File {
        return File.openSync(this.path, ...pathList);
    }

    public async readFile(...pathList: string[]): Promise<string> {
        return await (await this.openFile(...pathList)).read();
    }

    public readFileSync(...pathList: string[]): string {
        return this.openFileSync(...pathList).readSync();
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

    public hasEntrySync(...nameList: string[]): Folder | File | null {
        const file = this.entryListSync;

        return this.entryListSync.find(entry => nameList.includes(entry.name)) || null;
    }

    /**
     * Returns the first folder found from the folder name list
     */
    public async hasFolder(...nameList: string[]): Promise<Folder | null> {
        return (await this.folderList).find(folder => nameList.includes(folder.name)) || null;
    }

    /**
     * Returns the first folder found from the folder name list synchronously
     */
    public hasFolderSync(...nameList: string[]): Folder | null {
        return this.folderListSync.find(folder => nameList.includes(folder.name)) || null;
    }

    /**
     * Returns the first file found from the file name list
     */
    public async hasFile(...nameList: string[]): Promise<File | null> {
        return (await this.fileList).find(file => nameList.includes(file.name)) || null;
    }

    /**
     * Returns the first file found from the file name list synchronously
     */
    public hasFileSync(...nameList: string[]): File | null {
        return this.fileListSync.find(file => nameList.includes(file.name)) || null;
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

    public get entryListSync(): (Folder | File) [] {
        const entryList = [];

        const directoryHandle = fs.opendirSync(this.path);

        for (let entry; entry = directoryHandle.readSync();) {
            if (entry.isDirectory()) {
                entryList.push(this.openFolderSync(entry.name));
            }
            else if (entry.isFile()) {
                entryList.push(this.openFileSync(entry.name));
            }
        }

        return entryList;
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

    public get folderListSync(): Folder[] {
        const folderList = [];

        for (const entry of this.entryListSync) {
            if (entry instanceof Folder) {
                folderList.push(entry);
            }
        }

        return folderList;
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

    public get fileListSync(): File[] {
        const fileList = [];

        for (const entry of this.entryListSync) {
            if (entry instanceof File) {
                fileList.push(entry);
            }
        }

        return fileList;
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

    public get recursiveFileListSync(): File[] {
        const fileList = [];

        for (const entry of this.entryListSync) {
            if (entry instanceof File) {
                fileList.push(entry);
            }
            else if (entry instanceof Folder) {
                fileList.push(...entry.recursiveFileListSync);
            }
        }

        return fileList;
    }

    public async require<T = any>(): Promise<T> {
        const indexFile = await this.hasFile("index.js", this.name + ".js");

        if (indexFile) return await indexFile.require<T>();

        throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
    }

    public requireSync<T = any>(): T {
        const indexFile = this.hasFileSync("index.js", this.name + ".js");

        if (indexFile) return indexFile.require<T>();

        throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
    }
}
