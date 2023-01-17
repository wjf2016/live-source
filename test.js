import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nReadlines from "n-readlines";
import { mergeTxtPlayList } from "./utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (p) => path.resolve(__dirname, p);

// const txtPlayListPathArr = [
//   resolve("./list/aptv.txt"),
//   //   resolve("./list/iptv.txt"),
// ];
// const savePath = resolve("./merged/all.txt");

// const result = mergeTxtPlayList(txtPlayListPathArr, savePath);

// console.log(result);

const broadbandLines = new nReadlines(resolve("./test.txt"));

let line;

while ((line = broadbandLines.next())) {
  console.log(line.toString("utf-8"));
}
