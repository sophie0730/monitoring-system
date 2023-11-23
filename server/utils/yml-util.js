import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, '..', 'yml', 'pulse.yml');
const configFile = yaml.load(fs.readFileSync(filePath), 'utf-8');

const alertFilePath = path.join(__dirname, '..', 'yml', configFile.rule_files[0]);
export const alertFile = yaml.load(fs.readFileSync(alertFilePath), 'utf-8');
// 現在先設只能有一個config檔!!
console.log(alertFile);
export default alertFile;