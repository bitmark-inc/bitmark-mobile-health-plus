import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView,
} from 'react-native';

import { FullComponent } from './../../../../../commons/components';
import localAddPropertyStyle from './edit-label.component.style';
import defaultStyle from './../../../../../commons/styles';


const MetadataLabelSamples = [
  'Created (date)', 'Contributor', 'Coverage', 'Creator',
  'Description', 'Dimensions', 'Duration', 'Edition',
  'Format', 'Identifier', 'Language', 'License',
  'Medium', 'Publisher', 'Relation', 'Rights',
  'Size', 'Source', 'Subject', 'Keywords',
  'Type', 'Version'];

export class LocalIssueFileEditLabelComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    let suggesions = [];
    let label = this.props.navigation.state.params.label || ''
    MetadataLabelSamples.forEach((text, key) => {
      if (!label || text.toLowerCase().indexOf(label.toLowerCase()) >= 0) {
        suggesions.push({ key, text });
      }
    });
    this.state = { label: this.props.navigation.state.params.label || '', suggesions };
  }
  onChangeText(label) {
    let suggesions = [];
    MetadataLabelSamples.forEach((text, key) => {
      if (!label || text.toLowerCase().indexOf(label.toLowerCase()) >= 0) {
        suggesions.push({ key, text });
      }
    });
    this.setState({ label, suggesions });
  }
  render() {
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyle.headerTitle, { color: this.state.label ? 'black' : '#C1C1C1' }]}>{this.state.label || 'LABEL'}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
            this.props.navigation.state.params.onEndChangeMetadataKey(this.props.navigation.state.params.key, this.state.label);
            this.props.navigation.goBack();
          }}>
            <Text style={defaultStyle.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>)}
        content={(<View style={localAddPropertyStyle.body}>
          <ScrollView style={localAddPropertyStyle.bodyContent}>
            <TextInput style={localAddPropertyStyle.inputLabel} placeholder='SELECT OR CREATE A NEW LABEL'
              multiline={false}
              value={this.state.label}
              onChangeText={this.onChangeText}
              onSubmitEditing={this.onEndChangeMetadataValue}
              returnKeyLabel="done"
              returnKeyType="done"
            />
            <View style={localAddPropertyStyle.inputLabelBar} />
            <View style={localAddPropertyStyle.suggesionsList}>
              <FlatList
                data={this.state.suggesions}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={localAddPropertyStyle.suggesionsButton} onPress={() => this.onChangeText(item.text)}>
                    <Text style={localAddPropertyStyle.suggesionsButtonText}>{item.text}</Text>
                  </TouchableOpacity>);
                }}
              />
            </View>
          </ScrollView>
        </View>)}
      />
    );
  }
}

LocalIssueFileEditLabelComponent.propTypes = {
  screenProps: PropTypes.shape({
    addPropertyNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        label: PropTypes.string,
        key: PropTypes.number,
        onEndChangeMetadataKey: PropTypes.func,
      }),
    }),
  }),
}