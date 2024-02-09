/// <reference types="node" />
import { Folder } from "./folder";
import { File } from "./file";
import { FSWatcher } from "fs";
export declare abstract class Entry<T extends Folder | File> {
    readonly path: string;
    protected static folderInstances: {
        [key: string]: Folder;
    };
    protected static fileInstances: {
        [key: string]: File;
    };
    protected constructor(path: string);
    get name(): string;
    get parent(): Promise<Folder>;
    private removeFolderInstance;
    private removeFileInstance;
    delete(): Promise<void>;
    rename(newName: string): Promise<void>;
    private $watcher?;
    get watcher(): FSWatcher;
}
//# sourceMappingURL=entry.d.ts.map