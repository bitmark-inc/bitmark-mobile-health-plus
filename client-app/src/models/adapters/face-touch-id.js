import { NativeModules } from 'react-native'
let SwiftFaceTouchId = NativeModules.TouchID;

const FaceTouchId = {
  isSupported: () => {
    return new Promise((resolve, reject) => {
      SwiftFaceTouchId.isSupported((ok) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error('Can not check [Face or Touch Id] feature in this device!'));
        }
      });
    });
  },
};
export { FaceTouchId };