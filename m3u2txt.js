const fs = require("fs");
const path = require("path");

const resolve = (p) => path.resolve(__dirname, p);
const m3uPath = resolve("./good/iptv.m3u");

const m3uArr = fs
  .readFileSync(m3uPath, "utf8")
  .split(/(\r\n|\n|\r)/)
  .filter((item) => item.trim());

const tempArr = [];

while (m3uArr.length) {
  const current = m3uArr.shift();

  if (current.startsWith("#EXTINF:-1")) {
    const findResult = current
      .split(" ")
      .find((item) => item.startsWith("group-title="));

    if (findResult) {
      // TODO 需要兼容没有分组的情况
      const matchResult = findResult.match(/group-title="(.*?)",(.*)/);

      if (matchResult) {
        const [, group, name] = matchResult;
        const current = m3uArr.shift();

        if (current && !current.startsWith("#EXTINF:-1")) {
          const findIndex = tempArr.findIndex((item) => item.group === group);

          if (findIndex !== -1) {
            const item = tempArr[findIndex];

            if (!item.urls) {
              item.urls = [];
            }

            item.urls.push(`${name},${current}`);
          } else {
            tempArr.push({ group, urls: [`${name},${current}`] });
          }
        }
      }
    }
  }
}

console.log(tempArr);
