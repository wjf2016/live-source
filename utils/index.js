import fs from "fs";
import { M3uParser, M3uPlaylist, M3uMedia } from "m3u-parser-generator";

/**
 * 数组去重
 *
 * @param {array} arr
 * @returns {array}
 */
function uniqueArr(arr) {
  return [...new Set(arr)];
}

/**
 * 对频道数组去重和排序
 *
 * @param {array} channelGroup 频道数组
 * @returns {array} 频道数组
 */
function channelGroupUnique(channelGroup) {
  // 对url去重和排序
  channelGroup.forEach((group) => {
    group.urls = uniqueArr(group.urls);
    // group.urls.sort();
  });

  const provinces = [
    "央视",
    "广东",
    "网络",
    "教育",
    "NewTV",
    "北京",
    "天津",
    "上海",
    "重庆",
    "广西",
    "云南",
    "福建",
    "浙江",
    "湖南",
    "湖北",
    "江苏",
    "贵州",
    "四川",
    "安徽",
    "河南",
    "河北",
    "江西",
    "山东",
    "山西",
    "陕西",
    "吉林",
    "宁夏",
    "辽宁",
    "黑龙江",
    "内蒙古",
    "甘肃",
    "青海",
    "新疆",
    "西藏",
    "景区",
  ];

  const tempArr = [];

  // 对频道分类进行排序
  provinces.forEach((province) => {
    const findIndex = channelGroup.findIndex(
      (item) => item.groupTitle === province
    );

    if (findIndex !== -1) {
      const channelDeleted = channelGroup.splice(findIndex, 1);
      tempArr.push(channelDeleted[0]);
    }
  });

  tempArr.push(...channelGroup);
  return tempArr;
}

/**
 * txt播放列表转为频道数组并且对频道url去重、对频道url排序、对频道分类排序
 *
 * @export
 * @param {string} txtPlayList txt播放列表内容
 * @returns {array} 频道数组
 */
export function txtPlayListToChannelGroup(txtPlayList) {
  const regExp = /(\r?\n){2,}/gm;
  let splitResult = txtPlayList.split(regExp).filter((item) => item.trim());

  let channelGroup = [];

  splitResult.forEach((item) => {
    let [groupTitle, urls] = item.split(",#genre#");

    if (!urls) {
      urls = groupTitle;
      groupTitle = "未分组";
    }

    groupTitle = groupTitle.trim();
    urls = urls.split(/(\r\n|\n|\r)/).filter((item) => item.trim());

    const findIndex = channelGroup.findIndex(
      (item) => item.groupTitle === groupTitle
    );

    if (findIndex !== -1) {
      const item = channelGroup[findIndex];

      if (!item.urls) {
        item.urls = [];
      }

      item.urls.concat(urls);
    } else {
      channelGroup.push({
        groupTitle: groupTitle,
        urls,
      });
    }
  });

  channelGroup = channelGroupUnique(channelGroup);
  return channelGroup;
}

/**
 * 频道数组转为txt播放列表
 *
 * @export
 * @param {array} channelGroup 频道数组
 * @returns {string} txt播放列表内容
 */
export function channelGroupToTxtPlayList(channelGroup) {
  const txtPlayList = channelGroup.reduce((prev, next) => {
    const groupData = `${next.groupTitle},#genre#\n${next.urls.join("\n")}\n\n`;

    return `${prev}${groupData}`;
  }, "");

  return txtPlayList;
}

/**
 * 合并多个txt播放列表
 *
 * @export
 * @param {array} txtPlayListPathArr txt播放列表路径数组
 * @param {string} savePath txt播放列表保存路径
 * @returns {string} txt播放列表内容
 */
export function mergeTxtPlayList(txtPlayListPathArr, savePath) {
  const txtPlayListMerged = txtPlayListPathArr
    .map((item) => fs.readFileSync(item, "utf8"))
    .join("\n\n");

  const channelGroup = txtPlayListToChannelGroup(txtPlayListMerged);
  const txtPlayList = channelGroupToTxtPlayList(channelGroup);

  if (savePath) {
    fs.writeFileSync(savePath, txtPlayList);
  }

  return txtPlayList;
}

/**
 * m3u播放列表转为txt播放列表
 *
 * @export
 * @param {string} m3uPath m3u播放列表路径
 * @param {string} savePath txt播放列表保存路径
 * @returns {string} txt播放列表内容
 */
export function m3uToTxtPlayList(m3uPath, savePath) {
  const m3uString = fs.readFileSync(m3uPath, "utf8");
  const m3uPlaylist = M3uParser.parse(m3uString);
  let channelGroup = [];

  m3uPlaylist.medias.forEach((media) => {
    const name = media.name.trim();
    const location = media.location.trim();
    const groupTitle =
      media.attributes && media.attributes["group-title"]
        ? media.attributes["group-title"]
        : "";

    const findIndex = channelGroup.findIndex(
      (item) => item.groupTitle === groupTitle
    );

    if (findIndex !== -1) {
      const item = channelGroup[findIndex];

      if (!item.urls) {
        item.urls = [];
      }

      item.urls.push(`${name},${location}`);
    } else {
      channelGroup.push({
        groupTitle,
        urls: [`${name},${location}`],
      });
    }
  });

  channelGroup = channelGroupUnique(channelGroup);

  const txtPlayList = channelGroupToTxtPlayList(channelGroup);

  if (savePath) {
    fs.writeFileSync(savePath, txtPlayList);
  }

  return txtPlayList;
}

/**
 * txt播放列表转为m3u播放列表
 *
 * @export
 * @param {string} txtPlayListPath txt播放列表路径
 * @param {string} savePath m3u播放列表保存路径
 * @returns {string} m3u播放列表内容
 */
export function txtPlayListToM3u(txtPlayListPath, savePath) {
  const txtPlayList = fs.readFileSync(txtPlayListPath, "utf8");
  const channelGroup = txtPlayListToChannelGroup(txtPlayList);
  const playlist = new M3uPlaylist();

  channelGroup.forEach((group) => {
    const { groupTitle, urls } = group;

    urls.forEach((url) => {
      const [name, location] = url.split(",");
      const media = new M3uMedia(location);

      media.attributes = { "group-title": groupTitle };
      media.duration = -1;
      media.name = name;

      playlist.medias.push(media);
    });
  });

  const m3uString = playlist.getM3uString();

  if (savePath) {
    fs.writeFileSync(savePath, m3uString);
  }

  return m3uString;
}

export function createGroupDataFromTxtPlayList(...txtPlayLists) {}

export function txtPlayListAddGroup(txtPlayList) {}
