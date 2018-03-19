import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, ScrollView, FlatList,
  Alert
} from 'react-native';
import Mailer from 'react-native-mail';

import { StudyCardComponent } from './../study-card/study-card.component';
import studiesStyles from './studies.component.style';

const StudyTypes = {
  joined: 'JOINED',
  other: 'BROWSER',
}

export class StudiesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.contactBitmark = this.contactBitmark.bind(this);

    let studies = [];
    // TODO

    this.state = {
      studies,
      type: StudyTypes.other,
    };
  }
  // ==========================================================================================
  // ==========================================================================================
  contactBitmark() {
    Mailer.mail({ recipients: ['support@bitmark.com'], }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  }
  switchType(type) {
    this.setState({ type });
  }

  render() {
    return (
      <View style={[studiesStyles.body]}>
        <View style={studiesStyles.subTabArea}>
          {this.state.type === StudyTypes.other && <TouchableOpacity style={[studiesStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={studiesStyles.subTabButtonArea}>
              <View style={[studiesStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={studiesStyles.subTabButtonTextArea}>
                <Text style={studiesStyles.subTabButtonText}>{StudyTypes.other.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.type !== StudyTypes.other && <TouchableOpacity style={[studiesStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchType(StudyTypes.other)}>
            <View style={studiesStyles.subTabButtonArea}>
              <View style={[studiesStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={studiesStyles.subTabButtonTextArea}>
                <Text style={[studiesStyles.subTabButtonText, { color: '#C1C1C1' }]}>{StudyTypes.other.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.type === StudyTypes.joined && <TouchableOpacity style={[studiesStyles.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={studiesStyles.subTabButtonArea}>
              <View style={[studiesStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={studiesStyles.subTabButtonTextArea}>
                <Text style={studiesStyles.subTabButtonText}>{StudyTypes.joined.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.type !== StudyTypes.joined && <TouchableOpacity style={[studiesStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchType(StudyTypes.joined)}>
            <View style={studiesStyles.subTabButtonArea}>
              <View style={[studiesStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={studiesStyles.subTabButtonTextArea}>
                <Text style={[studiesStyles.subTabButtonText, { color: '#C1C1C1' }]}>{StudyTypes.joined.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={studiesStyles.contentScroll}>
          {this.state.studies.length === 0 && this.state.type === StudyTypes.other && <View style={studiesStyles.content}>
            <Text style={studiesStyles.noCardTitle}>YOU’VE JOINED ALL THE STUDIES!</Text>
            <View style={studiesStyles.noCardMessageArea}>
              <View style={studiesStyles.contactMessageFirstLine}>
                <TouchableOpacity onPress={this.contactBitmark}>
                  <Text style={studiesStyles.contactButtonText}>Contact Bitmark</Text>
                </TouchableOpacity>
                <Text style={studiesStyles.noCardMessage}> if you would like to publish</Text>
              </View>
              <Text style={studiesStyles.noCardMessage}>a study.</Text>
            </View>
          </View>}

          {this.state.studies.length === 0 && this.state.type === StudyTypes.joined && <View style={studiesStyles.content}>
            <Text style={studiesStyles.noCardTitle}>YOU’VE JOINED ALL THE STUDIES!</Text>
            <Text style={studiesStyles.noCardMessageArea}>
              <Text style={studiesStyles.noCardMessage}>Browse studies to find where you can donate your data.</Text>
            </Text>
          </View>}

          {this.state.studies.le0ngth > 0 && <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            <View style={studiesStyles.content}>
              <FlatList
                extraData={this.state}
                data={this.state.studies}
                renderItem={({ item }) => {
                  return (<TouchableOpacity onPress={() => this.props.screenProps.homeNavigation.navigate('StudyDetail', { study: item.study })}>
                    <StudyCardComponent
                      title={item.study.title}
                      joined={!!item.study.joinedDate}
                      description={item.study.description}
                      interval={item.study.interval}
                      duration={item.study.duration || item.study.durationText} />
                  </TouchableOpacity>)
                }}
              />
            </View>
          </TouchableOpacity>}
        </ScrollView>
      </View>
    );
  }
}

StudiesComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}