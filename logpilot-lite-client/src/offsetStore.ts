import fs from 'fs';
import path from 'path';

const OFFSET_FILE = path.join(__dirname, '..', 'offsets.json');

interface OffsetMap {
  [consumerId: string]: string;
}

function readOffsets(): OffsetMap {
  if (!fs.existsSync(OFFSET_FILE)) return {};
  const raw = fs.readFileSync(OFFSET_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeOffsets(offsets: OffsetMap): void {
  fs.writeFileSync(OFFSET_FILE, JSON.stringify(offsets, null, 2), 'utf-8');
}

export function getOffset(consumerId: string): string | undefined {
  const offsets = readOffsets();
  return offsets[consumerId];
}

export function setOffset(consumerId: string, timestamp: string): void {
  const offsets = readOffsets();
  offsets[consumerId] = timestamp;
  writeOffsets(offsets);
}
