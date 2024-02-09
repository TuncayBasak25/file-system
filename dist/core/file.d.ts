import { Entry } from "./entry";
export declare class File extends Entry<File> {
    static open(filePath: string, ...pathList: string[]): Promise<File>;
    private init;
    require(): Promise<any>;
    read(): Promise<string>;
    write(text: string): Promise<void>;
    append(text: string): Promise<void>;
    copy(destPath: string): Promise<void>;
    get basename(): string;
    get extension(): string;
}
//# sourceMappingURL=file.d.ts.map