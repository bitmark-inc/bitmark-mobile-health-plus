import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, SafeAreaView, TouchableOpacity, Text, Image,
} from 'react-native';
import { convertWidth } from 'src/utils';
import { AddRecordOptionsComponent } from "./add-record-options.component";
import { ShadowTopComponent } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';

export class AddRecordComponent extends Component {
  static propTypes = {
    takePhoto: PropTypes.func,
    importRecord: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {
      showAddRecordOptions: false
    }
  }

  showAddRecordOptions() {
    this.setState({ showAddRecordOptions: true });
  }

  hideAddRecordOptions() {
    this.setState({ showAddRecordOptions: false });
  }

  takePhoto() {
    this.hideAddRecordOptions();
    this.props.takePhoto();
  }

  importRecord() {
    this.hideAddRecordOptions();
    this.props.importRecord();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.bodySafeView}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>ADD FIRST MEDICAL RECORD</Text>
                <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*IMAGE*/}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={[styles.introductionImageArea]}>
                    <Image style={styles.addRecordImage} source={require('assets/imgs/add-record.png')} />
                  </View>
                </View>
                {/*DESC*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionTitle]}>Secure your first medical record</Text>
                  <Text style={[styles.introductionDescription]}>Upload and store all your medical records, such as reports, prescriptions, images, vaccinations, and bills.</Text>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent]}>
                <TouchableOpacity style={[styles.buttonNext, { marginRight: 50 }]} onPress={Actions.pop}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonNext]} onPress={this.showAddRecordOptions.bind(this)}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>START</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/*ADD RECORDS DIALOG*/}
        {this.state.showAddRecordOptions &&
          <AddRecordOptionsComponent takePhoto={this.takePhoto.bind(this)} importRecord={this.importRecord.bind(this)} close={this.hideAddRecordOptions.bind(this)} />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
  },
  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16)
  },
  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    color: '#000000',
    letterSpacing: 1.5
  },
  logo: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bottomArea: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  addRecordImage: {
    resizeMode: 'contain',
    width: 247,
    height: 294,
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
  },
  introductionTextArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 24,
    textAlign: 'left',
    letterSpacing: 0.15,
  },
  introductionDescription: {
    marginTop: 15,
    fontFamily: 'AvenirNextW1G-Regular',
    letterSpacing: 0.25,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
  }
});