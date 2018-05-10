package com.bitmark;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.microsoft.codepush.react.CodePush;
import com.rnziparchive.RNZipArchivePackage;
import com.imagepicker.ImagePickerPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.brentvatne.react.ReactVideoPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.chirag.RNMail.RNMail;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactNativeDocumentPicker(),
            new CodePush(null, getApplicationContext(), BuildConfig.DEBUG),
            new RNZipArchivePackage(),
            new ImagePickerPackage(),
            new RCTCameraPackage(),
            new RNDeviceInfo(),
            new ReactVideoPackage(),
            new ReactNativePushNotificationPackage(),
            new RNMail(),
            new RNFSPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
