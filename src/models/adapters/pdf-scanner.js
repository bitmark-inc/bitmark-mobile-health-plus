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
