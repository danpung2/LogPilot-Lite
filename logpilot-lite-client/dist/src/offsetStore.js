"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffset = getOffset;
exports.setOffset = setOffset;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const OFFSET_FILE = path_1.default.join(__dirname, '..', 'offsets.json');
function readOffsets() {
    if (!fs_1.default.existsSync(OFFSET_FILE))
        return {};
    const raw = fs_1.default.readFileSync(OFFSET_FILE, 'utf-8');
    try {
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeOffsets(offsets) {
    fs_1.default.writeFileSync(OFFSET_FILE, JSON.stringify(offsets, null, 2), 'utf-8');
}
function getOffset(consumerId) {
    const offsets = readOffsets();
    return offsets[consumerId];
}
function setOffset(consumerId, timestamp) {
    const offsets = readOffsets();
    offsets[consumerId] = timestamp;
    writeOffsets(offsets);
}
