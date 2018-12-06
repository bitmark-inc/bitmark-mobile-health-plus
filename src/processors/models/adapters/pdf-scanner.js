import { NativeModules } from 'react-native';

const PDFScannerNative = NativeModules.PDFScanner;

const PDFScanner = {
  pdfScan: (filePath) => {
    return new Promise((resolve) => {
      PDFScannerNative.pdfScan(filePath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
    });
  },
  pdfThumbnail: (filePath, width, height, outputPath) => {
    return new Promise((resolve) => {
      PDFScannerNative.pdfThumbnail(filePath, width, height, outputPath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
    });
  },
  pdfThumbnails: (filePath, width, height, outputFolderPath) => {
    return new Promise((resolve) => {
      PDFScannerNative.pdfThumbnails(filePath, width, height, outputFolderPath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
    });
  },
  pdfCombine: (imagePaths, output) => {
    return new Promise((resolve, reject) => {
      PDFScannerNative.pdfCombine(imagePaths, output, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error(result));
        }
      });
    });
  }
};

export default PDFScanner;
export { PDFScanner };
