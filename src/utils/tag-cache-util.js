import { getLocalCachesFolderPath } from "./local-storage-util";
import { FileUtil } from "./file-util";

const getTagsCache = async (bitmarkAccountNumber) => {
  let tagsCache = [];
  let tagsCacheFilePath = `${getLocalCachesFolderPath(bitmarkAccountNumber)}/tags_cache.txt`;

  if (await FileUtil.exists(tagsCacheFilePath)) {
    let tagsStr = await FileUtil.readFile(tagsCacheFilePath, 'utf8');
    tagsCache = tagsStr.split(' ');
  }

  return tagsCache;
};

const writeTagsCache = async (tags, bitmarkAccountNumber) => {
  // Only store top latest 10 tags
  if (tags.length > 10) {
    tags = tags.slice(0, 10);
  }

  let tagsCacheFilePath = `${getLocalCachesFolderPath(bitmarkAccountNumber)}/tags_cache.txt`;
  await FileUtil.writeFile(tagsCacheFilePath, tags.join(' '), 'utf8');
};

export {
  getTagsCache,
  writeTagsCache
}