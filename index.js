import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nReadlines from "n-readlines";
import { m3uToTxtPlayList, txtPlayListToM3u } from "./utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (p) => path.resolve(__dirname, p);

const txtPlayListPath = resolve("./list/aptv.txt");
const savePath = resolve("./list/aptv.m3u");
const result = txtPlayListToM3u(txtPlayListPath, savePath);
// const m3uPath = resolve("./list/iptv.m3u");
// const savePath = resolve("./list/iptv.txt");
// const result = m3uToTxtPlayList(m3uPath, savePath);

console.log(result);
