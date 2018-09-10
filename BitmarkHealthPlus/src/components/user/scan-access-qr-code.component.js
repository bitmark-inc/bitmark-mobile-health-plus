import React from 'react';
import Permissions from 'react-native-permissions'
import {
  Text, View, TouchableOpacity, Image, SafeAreaView,
  Linking,
  StyleSheet
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { convertWidth } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { AppProcessor } from './../../processors';
import { EventEmitterService } from '../../services';

export class ScanAccessQRCodeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.scanned = false;
    this.state = {
      permission: null,
      step: 'scanning',
      grantor: '',
    }

    Permissions.check('camera').then(permission => {
      if (permission === 'undetermined') {
        Permissions.request('camera').then(permission => {
          this.setState({ permission })
        });
      } else {
        this.setState({ permission })
      }
    });
  }

  onBarCodeRead(scanData) {
    this.cameraRef.stopRecording();
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let token = scanData.data;
    AppProcessor.doReceivedAccessQRCode(token).then(result => {
      if (result) {
        this.setState({ step: 'done', grantor: result.sender });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (<SafeAreaView style={styles.bodySafeView}>
      <View style={styles.body}>
        {this.state.step === 'scanning' && <View style={styles.bodyContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{this.state.permission === 'denied' ? 'Enable camera access' : 'Sign access code'}</Text>
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles.content, this.state.permission === 'denied' ? { justifyContent: 'space-between', } : {}]}>
            {this.state.permission === 'authorized' && <RNCamera
              ref={(ref) => this.cameraRef = ref}
              style={styles.scanCamera}
              type={RNCamera.Constants.Type.back}
              onBarCodeRead={this.onBarCodeRead.bind(this)}
            />}
            {this.state.permission === 'authorized' && <Text style={styles.authorizedMessage}>
              Align QR Code within frame to scan.
            </Text>}

            {this.state.permission === 'denied' && <Text style={styles.deniedMessage}>
              Grant camera access for Bitmark Health to scan an access code.{'\n\n'}
            </Text>}
            {this.state.permission === 'denied' && <View style={styles.deniedButtonArea}>
              <TouchableOpacity style={styles.deniedButton} onPress={() => Linking.openURL('app-settings:')}>
                <Text style={styles.deniedButtonText}>{'Enable Camera Access'.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
            }
          </View>
        </View>}
        {this.state.step !== 'scanning' && <View style={[styles.bodyContent, { backgroundColor: '#FF4444' }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: 'white' }]}>Waiting for confirmation</Text>
          </View>
          <View style={styles.content}>
            <Text style={[styles.authorizedMessage, { color: 'white' }]}>You have to wait {'[' + this.state.grantor.substring(0, 4) + '...' + this.state.grantor.substring(this.state.grantor.length - 5, this.state.grantor.length) + ']'} to confirm this request.</Text>
          </View>
          <View style={[styles.deniedButtonArea, { paddingBottom: 20, }]}>
            <TouchableOpacity style={[styles.deniedButton, { backgroundColor: 'white' }]} onPress={() => { Actions.reset('user') }}>
              <Text style={[styles.deniedButtonText, { color: '#FF4444' }]}>{'OK'.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>}
      </View>
    </SafeAreaView>);
  }
}


const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: "100%",
  },
  title: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 34,
    color: '#464646',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  closeIcon: {
    width: convertWidth(30),
    height: convertWidth(30),
    resizeMode: 'contain',
  },
  content: {
    flexDirection: 'column',
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scanCamera: {
    width: '100%',
    height: convertWidth(350),
  },
  authorizedMessage: {
    padding: convertWidth(20),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },
  deniedMessage: {
    padding: convertWidth(20),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },
  deniedButtonArea: {
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  deniedButton: {
    backgroundColor: "#FF4444",
    width: '100%',
    height: constants.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deniedButtonText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '900',
    fontSize: 16,
    color: 'white',
  },
});
