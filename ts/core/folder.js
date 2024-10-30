"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
const entry_1 = require("./entry");
class Folder extends entry_1.Entry {
    static open(folderPath, ...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            const absolute = path_1.default.resolve(path_1.default.join(folderPath, ...pathList));
            if (Folder.folderInstances[absolute]) {
                return Folder.folderInstances[absolute];
            }
            const folder = new Folder(absolute);
            Folder.folderInstances[absolute] = folder;
            return yield folder.init();
        });
    }
    static openSync(folderPath, ...pathList) {
        const absolute = path_1.default.resolve(path_1.default.join(folderPath, ...pathList));
        if (Folder.folderInstances[absolute]) {
            return Folder.folderInstances[absolute];
        }
        const folder = new Folder(absolute);
        Folder.folderInstances[absolute] = folder;
        return folder.initSync();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (yield fs_1.default.promises.opendir(this.path)).close();
            }
            catch (e) {
                yield fs_1.default.promises.mkdir(this.path);
            }
            return this;
        });
    }
    initSync() {
        try {
            fs_1.default.opendirSync(this.path).close();
        }
        catch (e) {
            fs_1.default.mkdirSync(this.path);
        }
        return this;
    }
    openFolder(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return Folder.open(this.path, ...pathList);
        });
    }
    openFolderSync(...pathList) {
        return Folder.openSync(this.path, ...pathList);
    }
    copy(targetPath, exclude = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const promiseList = [];
            const targetFolder = yield Folder.open(targetPath);
            if (typeof exclude === "string")
                exclude = [exclude];
            for (const entry of (yield this.entryList).filter(file => !exclude.includes(file.name))) {
                if (entry instanceof file_1.File)
                    promiseList.push(entry.copy(targetFolder.path, entry.name));
                else
                    promiseList.push(entry.copy(path_1.default.join(targetFolder.path, entry.name), exclude));
            }
            yield Promise.all(promiseList);
            return targetFolder;
        });
    }
    copySync(targetPath, exclude = []) {
        const targetFolder = Folder.openSync(targetPath);
        if (typeof exclude === "string")
            exclude = [exclude];
        for (const entry of this.entryListSync.filter(file => !exclude.includes(file.name))) {
            if (entry instanceof file_1.File)
                entry.copySync(targetFolder.path, entry.name);
            else
                entry.copySync(path_1.default.join(targetFolder.path, entry.name), exclude);
        }
        return targetFolder;
    }
    openFile(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return file_1.File.open(this.path, ...pathList);
        });
    }
    openFileSync(...pathList) {
        return file_1.File.openSync(this.path, ...pathList);
    }
    readFile(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.openFile(...pathList)).read();
        });
    }
    readFileSync(...pathList) {
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
    hasEntry(...nameList) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield this.entryList;
            return (yield this.entryList).find(entry => nameList.includes(entry.name)) || null;
        });
    }
    hasEntrySync(...nameList) {
        const file = this.entryListSync;
        return this.entryListSync.find(entry => nameList.includes(entry.name)) || null;
    }
    /**
     * Returns the first folder found from the folder name list
     */
    hasFolder(...nameList) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.folderList).find(folder => nameList.includes(folder.name)) || null;
        });
    }
    /**
     * Returns the first folder found from the folder name list synchronously
     */
    hasFolderSync(...nameList) {
        return this.folderListSync.find(folder => nameList.includes(folder.name)) || null;
    }
    /**
     * Returns the first file found from the file name list
     */
    hasFile(...nameList) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.fileList).find(file => nameList.includes(file.name)) || null;
        });
    }
    /**
     * Returns the first file found from the file name list synchronously
     */
    hasFileSync(...nameList) {
        return this.fileListSync.find(file => nameList.includes(file.name)) || null;
    }
    getEntryList() {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const entryList = [];
            const directoryHandle = yield fs_1.default.promises.opendir(this.path);
            try {
                for (var _d = true, directoryHandle_1 = __asyncValues(directoryHandle), directoryHandle_1_1; directoryHandle_1_1 = yield directoryHandle_1.next(), _a = directoryHandle_1_1.done, !_a; _d = true) {
                    _c = directoryHandle_1_1.value;
                    _d = false;
                    const entry = _c;
                    if (entry.isDirectory()) {
                        entryList.push(yield this.openFolder(entry.name));
                    }
                    else if (entry.isFile()) {
                        entryList.push(yield this.openFile(entry.name));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = directoryHandle_1.return)) yield _b.call(directoryHandle_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return entryList;
        });
    }
    get entryList() {
        return this.getEntryList();
    }
    get entryListSync() {
        const entryList = [];
        const directoryHandle = fs_1.default.opendirSync(this.path);
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
    getFolderList() {
        return __awaiter(this, void 0, void 0, function* () {
            const folderList = [];
            for (const entry of yield this.entryList) {
                if (entry instanceof Folder) {
                    folderList.push(entry);
                }
            }
            return folderList;
        });
    }
    get folderList() {
        return this.getFolderList();
    }
    get folderListSync() {
        const folderList = [];
        for (const entry of this.entryListSync) {
            if (entry instanceof Folder) {
                folderList.push(entry);
            }
        }
        return folderList;
    }
    getFileList() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileList = [];
            for (const entry of yield this.entryList) {
                if (entry instanceof file_1.File) {
                    fileList.push(entry);
                }
            }
            return fileList;
        });
    }
    get fileList() {
        return this.getFileList();
    }
    get fileListSync() {
        const fileList = [];
        for (const entry of this.entryListSync) {
            if (entry instanceof file_1.File) {
                fileList.push(entry);
            }
        }
        return fileList;
    }
    getRecursiveFileList(fileList = []) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const entry of yield this.entryList) {
                if (entry instanceof file_1.File) {
                    fileList.push(entry);
                }
                else if (entry instanceof Folder) {
                    yield entry.getRecursiveFileList(fileList);
                }
            }
            return fileList;
        });
    }
    get recursiveFileList() {
        return this.getRecursiveFileList();
    }
    get recursiveFileListSync() {
        const fileList = [];
        for (const entry of this.entryListSync) {
            if (entry instanceof file_1.File) {
                fileList.push(entry);
            }
            else if (entry instanceof Folder) {
                fileList.push(...entry.recursiveFileListSync);
            }
        }
        return fileList;
    }
    require() {
        return __awaiter(this, void 0, void 0, function* () {
            const indexFile = yield this.hasFile("index.js", this.name + ".js");
            if (indexFile)
                return yield indexFile.require();
            throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
        });
    }
    requireSync() {
        const indexFile = this.hasFileSync("index.js", this.name + ".js");
        if (indexFile)
            return indexFile.require();
        throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
    }
}
exports.Folder = Folder;
