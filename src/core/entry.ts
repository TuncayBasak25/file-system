import path from "path";
import { Folder } from "./folder";
import { File } from "./file";
import fs, { FSWatcher, watch } from "fs";

export abstract class Entry<T extends Folder | File> {

    protected static folderInstances: { [key: string]: Folder } = {};
    protected static fileInstances: { [key: string]: File } = {};

    protected constructor(public readonly path: string) { }

    public get name(): string {
        return path.basename(this.path);
    }

    public get parent(): Promise<Folder> {
        return Folder.open(this.path, "..");
    }

    private removeFolderInstance() {
        delete Entry.folderInstances[this.path];
    }

    private removeFileInstance() {
        delete Entry.fileInstances[this.path];
    }

    public async delete() {
        if (this instanceof Folder) {
            await fs.promises.rmdir(this.path);
            this.removeFolderInstance();
        }
        else {
            this.removeFileInstance();
            await fs.promises.rm(this.path);
        }

        this.$watcher?.close(); 
    }

    public async rename(newName: string) {
        if (this instanceof Folder) {
            this.removeFolderInstance();
        }
        else {
            this.removeFileInstance();
        }
        
        const separatedPath = this.path.split(path.sep);
        separatedPath[separatedPath.length - 1] = newName;

        (this as any).path = path.join(...separatedPath);

        if (this instanceof Folder) {
            Entry.folderInstances[this.path] = this;
        }
        else if (this instanceof File) {
            Entry.fileInstances[this.path] = this;
        }
        
        this.$watcher?.close();
    }

    private $watcher?: FSWatcher;
    public get watcher(): FSWatcher {
        if (this.$watcher) return this.$watcher;

        this.$watcher = watch(this.path);

        return this.$watcher;
    }
}