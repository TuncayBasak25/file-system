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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const entry_1 = require("./entry");
class File extends entry_1.Entry {
    static read(filePath, ...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield File.open(filePath, ...pathList)).read();
        });
    }
    static readSync(filePath, ...pathList) {
        return File.openSync(filePath, ...pathList).readSync();
    }
    static open(filePath, ...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            const absolute = path_1.default.resolve(path_1.default.join(filePath, ...pathList));
            if (File.fileInstances[absolute]) {
                return File.fileInstances[absolute];
            }
            const file = new File(absolute);
            File.fileInstances[absolute] = file;
            return yield file.init();
        });
    }
    static openSync(filePath, ...pathList) {
        const absolute = path_1.default.resolve(path_1.default.join(filePath, ...pathList));
        if (File.fileInstances[absolute]) {
            return File.fileInstances[absolute];
        }
        const file = new File(absolute);
        File.fileInstances[absolute] = file;
        return file.initSync();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.appendFile(this.path, "");
            return this;
        });
    }
    initSync() {
        fs_1.default.appendFileSync(this.path, "");
        return this;
    }
    require() {
        if (this.extension === 'js') {
            return require(this.path.slice(0, -3));
        }
        throw new Error("This file cannot be required! File: " + this.path.slice(0, -3));
    }
    parseJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.extension === 'json') {
                return JSON.parse(yield this.read());
            }
            throw new Error("This file cannot be parsed as JSON!");
        });
    }
    parseJSONSync() {
        if (this.extension === 'json') {
            return JSON.parse(this.readSync());
        }
        throw new Error("This file cannot be parsed as JSON!");
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return fs_1.default.promises.readFile(this.path, 'utf8');
        });
    }
    readSync() {
        return fs_1.default.readFileSync(this.path, 'utf8');
    }
    write(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.writeFile(this.path, text);
        });
    }
    writeSync(text) {
        fs_1.default.writeFileSync(this.path, text);
    }
    append(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.appendFile(this.path, text);
        });
    }
    appendSync(text) {
        fs_1.default.appendFileSync(this.path, text);
    }
    copy(destPath, ...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.read();
            const file = yield File.open(path_1.default.join(destPath, ...pathList));
            yield file.write(content);
            return file;
        });
    }
    copySync(destPath, ...pathList) {
        const content = this.readSync();
        const file = File.openSync(path_1.default.join(destPath, ...pathList));
        file.writeSync(content);
        return file;
    }
    get basename() {
        return this.name.includes(".") ? this.name.split(".").slice(0, -1).join(".") : this.name;
    }
    get extension() {
        return this.name.includes(".") ? this.name.split(".").pop() : "";
    }
}
exports.File = File;
