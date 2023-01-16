const fs = require("fs");
const path = require("path");

const resolve = (p) => path.resolve(__dirname, p);
const sourceFile = resolve("./list.json");
const sourceFileContent = fs.readFileSync(sourceFile, "utf-8");
let channels = [];

try {
  channels = JSON.parse(sourceFileContent);
} catch (error) {}

const channelsObj = {};

channels = channels.map((channel) => {
  const { name, prov, urls } = channel;

  if (!channelsObj[prov]) {
    channelsObj[prov.trim()] = [];
  }

  urls
    .split("#@")
    .filter((url) => url.match(/^https?:\/\//))
    .forEach((url) => {
      channelsObj[prov].push(`${name},${url}`);
    });
});

channels = Object.keys(channelsObj).map((prov) => {
  return { prov, urls: channelsObj[prov] };
});

const result = channels.reduce((prev, next) => {
  const { prov, urls } = next;
  const provStr = `${prov},#genre#\n${urls.join("\n")}\n\n`;

  return `${prev}${provStr}`;
}, "");

fs.writeFileSync(resolve("./list.txt"), result);
