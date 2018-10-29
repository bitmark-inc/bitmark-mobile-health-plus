import { NativeModules } from 'react-native'
let AESDecrypt = NativeModules.AESDecrypt;

const CryptoAdapter = {
  decryptAES: (input, key, iv, cipher, output) => {
    return new Promise((resolve, reject) => {
      AESDecrypt.decryptAES(input, key, iv, cipher, output, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error(result));
        }
      });
    });
  },
};
export { CryptoAdapter };