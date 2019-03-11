import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';

class FileUtil {
  static CacheDirectory = RNFS.CachesDirectoryPath;
  static DocumentDirectory = RNFS.DocumentDirectoryPath;
  static SharedGroupDirectory = '';

  static async mkdir(folderPath) {
    return await RNFS.mkdir(folderPath, {
      NSURLIsExcludedFromBackupKey: true,
    });
  }
  static async create(filePath, data, encode) {
    return await RNFS.writeFile(filePath, data || '', encode || 'utf8');
  }
  static async remove(path) {
    return await RNFS.unlink(path);
  }
  static async removeSafe(path) {
    try {
      await RNFS.unlink(path);
    } catch (err) {
      console.log("File isn't existing");
    }
  }
  static async copyFile(sourcePath, destinationPath) {
    return await RNFS.copyFile(sourcePath, destinationPath);
  }
  static async moveFile(sourcePath, destinationPath) {
    console.log('moveFile :', sourcePath, destinationPath);
    return await RNFS.moveFile(sourcePath, destinationPath);
  }
  static async moveFileSafe(sourcePath, destinationPath) {
    console.log('moveFileSafe :', sourcePath, destinationPath);
    try {
      await RNFS.unlink(destinationPath);
    } catch (err) {
      console.log("Destination path isn't existing");
    }
    return await RNFS.moveFile(sourcePath, destinationPath);
  }
  static async downloadFile(urlDownload, filePath, headers) {
    const options = {
      fromUrl: urlDownload,
      toFile: filePath,
      headers,
    };
    return await RNFS.downloadFile(options).promise;
  }
  static async readDir(folderPath) {
    return await RNFS.readdir(folderPath);
  }
  static async readDirItem(folderPath) {
    return await RNFS.readDir(folderPath);
  }
  static async readFile(filePath, encoding) {
    return await RNFS.readFile(filePath, encoding);
  }
  static async writeFile(filePath, content, encoding) {
    return await RNFS.writeFile(filePath, content, encoding);
  }
  static async zip(inputPath, outputPath) {
    return await zip(inputPath, outputPath);
  }
  static async unzip(inputPath, outputPath) {
    return await unzip(inputPath, outputPath);
  }
  static async exists(filePath) {
    return await RNFS.exists(filePath);
  }
  static async stat(filePath) {
    try {
      return await RNFS.stat(filePath);
    } catch (err) {
      return {};
    }
  }
  static async copyDir(sourceFolderPath, destinationFolderPath, ignoreDuplication) {
    await FileUtil.mkdir(destinationFolderPath);

    let items = await FileUtil.readDirItem(sourceFolderPath);

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.isFile()) {
        if (ignoreDuplication) {
          let existingFile = await FileUtil.exists(`${destinationFolderPath}/${item.name}`);
          if (!existingFile) {
            await FileUtil.copyFile(item.path, `${destinationFolderPath}/${item.name}`)
          }
        } else {
          await FileUtil.copyFile(item.path, `${destinationFolderPath}/${item.name}`)
        }
      }

      if (item.isDirectory()) {
        let destDir = `${destinationFolderPath}/${item.name}`;
        await FileUtil.mkdir(destDir);
        await FileUtil.copyDir(item.path, destDir, ignoreDuplication);
      }
    }
  }
  static async moveDir(sourceFolderPath, destinationFolderPath) {
    await FileUtil.copyDir(sourceFolderPath, destinationFolderPath);
    await FileUtil.removeSafe(sourceFolderPath);
  }

  static async pathForGroup(groupIdentifier) {
    return await RNFS.pathForGroup(groupIdentifier);
  }

  static getSharedLocalStorageFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.SharedGroupDirectory}/${bitmarkAccountNumber}`;
  }

  static getLocalAssetsFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/assets`;
  }

  static getLocalThumbnailsFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/thumbnails`;
  }

  static getLocalDatabasesFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/databases`;
  }

  static getLocalCachesFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/caches`;
  }

  static getLocalIndexedDataFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/indexedData`;
  }

  static getLocalIndexedTagFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/indexTag`;
  }

  static getLocalIndexedNoteFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/indexNote`;
  }

  static getLocalIndexedNameFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber)}/indexName`;
  }

}

export { FileUtil };