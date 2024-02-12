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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.default.promises.opendir(this.path);
            }
            catch (e) {
                yield fs_1.default.promises.mkdir(this.path);
            }
            return this;
        });
    }
    openFolder(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return Folder.open(this.path, ...pathList);
        });
    }
    copy(targetFolder, exclude = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const promiseList = [];
            if (typeof exclude === "string")
                exclude = [exclude];
            for (const entry of (yield this.entryList).filter(file => !exclude.includes(file.name))) {
                if (entry instanceof file_1.File)
                    promiseList.push(entry.copy(targetFolder.path, entry.name));
                else
                    promiseList.push(entry.copy(entry));
            }
            yield Promise.all(promiseList);
        });
    }
    openFile(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return file_1.File.open(this.path, ...pathList);
        });
    }
    readFile(...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield this.openFile(...pathList)).read();
        });
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
    /**
     * Returns the first folder found from the folder name list
     */
    hasFolder(...nameList) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.folderList).find(folder => nameList.includes(folder.name)) || null;
        });
    }
    /**
     * Returns the first file found from the file name list
     */
    hasFile(...nameList) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.fileList).find(file => nameList.includes(file.name)) || null;
        });
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
    getFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = {};
            for (const folder of yield this.folderList)
                folders[folder.name] = folder;
            return folders;
        });
    }
    get folders() {
        return this.getFolders();
    }
    getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = {};
            for (const file of yield this.fileList)
                files[file.name] = file;
            return files;
        });
    }
    get files() {
        return this.getFiles();
    }
    require() {
        return __awaiter(this, void 0, void 0, function* () {
            const indexFile = yield this.hasFile("index.js", this.name + ".js");
            if (indexFile)
                return yield indexFile.require();
            throw new Error("To import a folder this folder has to have a index file or a file of the name of the folder FOLDER: " + this.path);
        });
    }
}
exports.Folder = Folder;
const old_warn = console.warn;
console.warn = (...argList) => {
    old_warn(...argList.filter(arg => typeof arg !== "string" || !arg.match(/Warning: Closing directory handle on garbage collection/)));
};
