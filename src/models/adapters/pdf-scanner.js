import {NativeModules} from 'react-native';

const PDFScannerNative = NativeModules.PDFScanner;

const PDFScanner = {
  pdfScan: (filePath) => {
    return new Promise((resolve, reject) => {
      PDFScannerNative.pdfScan(filePath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
    });
  }
};

export default PDFScanner;
