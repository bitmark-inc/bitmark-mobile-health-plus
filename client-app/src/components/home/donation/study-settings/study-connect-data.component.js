import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
} from 'react-native'

import styles from './study-settings.component.style';

export class StudyConnectDataComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ScrollView>
        <View style={styles.main}>

          <Image style={styles.dataSourceInstallIcon} source={require('./../../../../../assets/imgs/icon_health.png')} />
          <Text style={styles.dataSourceInstallApp}>Access Health Data</Text>
          <Text style={styles.dataSourceInstallDescription}>On the next screen, please tap the <Text style={{ fontWeight: '900' }}>“Turn All Categories On”</Text> button to access the data sources required for this study. </Text>
          <TouchableOpacity style={[styles.dataSourceInstallButton]} onPress={() => this.props.doJoinStudy()}>
            <Text style={styles.dataSourceInstallButtonText}>Next</Text>
          </TouchableOpacity>
          <Text style={styles.dataSourceInstallNote}>{"If you've previously joined a study or bitmark your health data, you may not need to authorize access again."}</Text>
        </View>
      </ScrollView>
    );
  }
}

StudyConnectDataComponent.propTypes = {
  doJoinStudy: PropTypes.func,
};

