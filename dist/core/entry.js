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
exports.Entry = void 0;
const path_1 = __importDefault(require("path"));
const folder_1 = require("./folder");
const file_1 = require("./file");
const fs_1 = __importStar(require("fs"));
class Entry {
    constructor(path) {
        this.path = path;
    }
    get name() {
        return path_1.default.basename(this.path);
    }
    get parent() {
        return folder_1.Folder.open(this.path, "..");
    }
    removeFolderInstance() {
        delete Entry.folderInstances[this.path];
    }
    removeFileInstance() {
        delete Entry.fileInstances[this.path];
    }
    delete() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this instanceof folder_1.Folder) {
                yield fs_1.default.promises.rmdir(this.path);
                this.removeFolderInstance();
            }
            else {
                this.removeFileInstance();
                yield fs_1.default.promises.rm(this.path);
            }
            (_a = this.$watcher) === null || _a === void 0 ? void 0 : _a.close();
        });
    }
    rename(newName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this instanceof folder_1.Folder) {
                this.removeFolderInstance();
            }
            else {
                this.removeFileInstance();
            }
            const separatedPath = this.path.split(path_1.default.sep);
            separatedPath[separatedPath.length - 1] = newName;
            this.path = path_1.default.join(...separatedPath);
            if (this instanceof folder_1.Folder) {
                Entry.folderInstances[this.path] = this;
            }
            else if (this instanceof file_1.File) {
                Entry.fileInstances[this.path] = this;
            }
            (_a = this.$watcher) === null || _a === void 0 ? void 0 : _a.close();
        });
    }
    get watcher() {
        if (this.$watcher)
            return this.$watcher;
        this.$watcher = (0, fs_1.watch)(this.path, { recursive: true });
        return this.$watcher;
    }
}
exports.Entry = Entry;
Entry.folderInstances = {};
Entry.fileInstances = {};
