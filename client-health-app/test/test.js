
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';


import { BitmarkComponent } from '../src/commons/components';
import { convertWidth } from '../src/utils';

const {
  View,
  TextInput,
  TouchableOpacity,
  Text,
} = ReactNative;

class MainComponent extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <BitmarkComponent
        contentInScroll={true}
        ref={(ref) => this.fullRef = ref}
        header={(<View style={{
          flex: 1, width: convertWidth(375),
          borderColor: 'green', borderWidth: 2.
        }}>

        </View>)}

        content={(
          <View style={{ flex: 1, }}>
            <TextInput onFocus={() => {
              this.selectedIndex = 0;
              this.fullRef.setFocusElement(this.inputRefs[0]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 1' autoCorrect={false} />
            <TextInput onFocus={() => {
              this.selectedIndex = 1;
              this.fullRef.setFocusElement(this.inputRefs[1]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 2' />
            <TextInput onFocus={() => {
              this.selectedIndex = 2;
              this.fullRef.setFocusElement(this.inputRefs[2]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 3' />
            <TextInput onFocus={() => {
              this.selectedIndex = 3;
              this.fullRef.setFocusElement(this.inputRefs[3]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 4' />
            <TextInput onFocus={() => {
              this.selectedIndex = 4;
              this.fullRef.setFocusElement(this.inputRefs[4]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 5' />
            <TextInput onFocus={() => {
              this.selectedIndex = 5;
              this.fullRef.setFocusElement(this.inputRefs[5]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 6' />
            <TextInput onFocus={() => {
              this.selectedIndex = 6;
              this.fullRef.setFocusElement(this.inputRefs[6]);
            }} ref={(ref) => {
              if (!this.inputRefs) {
                this.inputRefs = [];
              }
              this.inputRefs.push(ref);
            }} style={{
              height: 100,
              // borderWidth: 1,
            }} placeholder='Example 7' />
          </View>
        )}

        // footer={(<View style={{
        //   flex: 1, width: convertWidth(375),
        //   // borderWidth: 2, borderColor: 'green'
        // }}>
        // </View>)}

        keyboardExternal={(<View style={{ flex: 1, width: convertWidth(375), backgroundColor: 'gray' }} >
          <TouchableOpacity onPress={() => {
            this.selectedIndex = this.selectedIndex || 0;
            this.selectedIndex = (this.selectedIndex + 1) % 7;
            this.inputRefs[this.selectedIndex].focus();
            console.log('this.selectedIndex :', this.selectedIndex);
            this.fullRef.setFocusElement(this.inputRefs[this.selectedIndex]);
          }}>
            <Text>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.selectedIndex = this.selectedIndex || 0;
            this.selectedIndex = (this.selectedIndex + 6) % 7;
            this.inputRefs[this.selectedIndex].focus();
            console.log('this.selectedIndex :', this.selectedIndex);
            this.fullRef.setFocusElement(this.inputRefs[this.selectedIndex]);
          }}>
            <Text>Prev</Text>
          </TouchableOpacity>
        </View>)}
      />
    );
  }
}

MainComponent.propTypes = {
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      }),
    }),
  })
}

let BitmarkAppComponent = StackNavigator({
  Main: { screen: MainComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);
export { BitmarkAppComponent };