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

    public get basename(): string {
        return this.name;
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

    public deleteSync() {
        if (this instanceof Folder) {
            fs.rmdirSync(this.path);
            this.removeFolderInstance();
        }
        else {
            this.removeFileInstance();
            fs.rmSync(this.path);
        }

        this.$watcher?.close();
    }

    private $watcher?: FSWatcher;
    public get watcher(): FSWatcher {
        if (this.$watcher) return this.$watcher;

        this.$watcher = watch(this.path, { recursive: true });

        return this.$watcher;
    }
}