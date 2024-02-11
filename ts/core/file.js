"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.appendFile(this.path, "");
            return this;
        });
    }
    require() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.extension === 'js') {
                return Promise.resolve(`${path_1.default.join("file:", this.path)}`).then(s => __importStar(require(s)));
            }
            else if (this.extension === 'json') {
                return JSON.parse(yield this.read());
            }
            throw new Error("This file cannot be required!");
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return fs_1.default.promises.readFile(this.path, 'utf8');
        });
    }
    write(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.writeFile(this.path, text);
        });
    }
    append(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.default.promises.appendFile(this.path, text);
        });
    }
    copy(destPath, ...pathList) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.read();
            const file = yield File.open(path_1.default.join(destPath, ...pathList));
            yield file.write(content);
            return file;
        });
    }
    get basename() {
        return this.name.includes(".") ? this.name.split(".").slice(0, -1).join(".") : this.name;
    }
    get extension() {
        return this.name.includes(".") ? this.name.split(".").pop() : "";
    }
}
exports.File = File;
