import { File } from "./file";
import { Entry } from "./entry";
export declare class Folder extends Entry<File> {
    static open(folderPath: string, ...pathList: string[]): Promise<Folder>;
    private init;
    openFolder(name: string): Promise<Folder>;
    openFile(name: string): Promise<File>;
    private getEntryList;
    get entryList(): Promise<(Folder | File)[]>;
    private getFolderList;
    get folderList(): Promise<Folder[]>;
    private getFileList;
    get fileList(): Promise<File[]>;
    private getFolders;
    get folders(): Promise<{
        [key: string]: Folder;
    }>;
    private getFiles;
    get files(): Promise<{
        [key: string]: File;
    }>;
}
//# sourceMappingURL=folder.d.ts.map