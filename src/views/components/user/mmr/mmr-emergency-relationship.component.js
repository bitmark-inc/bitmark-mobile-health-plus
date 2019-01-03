import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';

const relationshipList = [
  'mother',
  'father',
  'parent',
  'bother',
  'sister',
  'son',
  'daugher',
  'chid',
  'friend',
  'spouse',
  'partner',
  'assisant',
  'manager',
  'other',
  'rommmate',
  'doctor',
  'emergency'
];


export class MMRMergencyRelationshipComponent extends Component {
  static propTypes = {
    contact: PropTypes.object,
    onSelectedRelation: PropTypes.func,
  };

  onSelectedRelation(relationship) {
    let contact = this.props.contact;
    contact.relationship = relationship;
    this.props.onSelectedRelation(contact);
    Actions.pop();
  }

  render() {
    return (
      <SafeAreaView style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => Actions.pop()}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Relationship</Text>
          <TouchableOpacity style={styles.headerRight} disabled={true} />
        </View>
        <ScrollView style={styles.bodyContent} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, }}>
          {relationshipList.map((item, index) => {
            return <TouchableOpacity key={index} style={styles.itemRow} onPress={() => this.onSelectedRelation.bind(this)(item)} >
              <Text style={styles.itemRowText}>{item}</Text>
            </TouchableOpacity>
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  header: {
    height: 56, width: '100%',
    flexDirection: 'row', alignItems: 'center',
  },
  headerLeft: {
    paddingLeft: convertWidth(19),
    width: convertWidth(35),
  },

  headerLeftBackIcon: {
    width: 16, height: '100%', resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 24, textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(35),
  },
  bodyContent: {
    flex: 1,
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
  },
  itemRow: {
    paddingTop: 10, paddingBottom: 10,
    borderBottomWidth: 0.5, borderBottomColor: 'grey'
  },
  itemRowText: {
    fontFamily: 'AvenirNextW1G-Regular', fontSize: 12,
  }
});
