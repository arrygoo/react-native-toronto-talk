import React from 'react';
import Expo, { Sound, Audio, Accelerometer, KeepAwake, Constants } from 'expo';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
Meteor.connect('ws://192.168.1.3:3000/websocket'); //do this only once

class AccelerometerSensor extends React.Component {
  state = {
    color: '100',
    accelerometerData: {}
  };

  componentDidMount() {
    Accelerometer.setUpdateInterval(300);
    this._toggle();
    this.registerPhone()
  }

  registerPhone() {
    console.log("Registering phone", Constants.sessionId);
    Meteor.collection('phones').insert({ sessionId: Constants.sessionId })
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _toggle = () => {
    if (this._subscription) {
      this._unsubscribe();
    } else {
      this._subscribe();
    }
  };

  _slow = () => {
    Accelerometer.setUpdateInterval(300);
    // const res = Meteor.collection('phones').findOne({ phoneName: '1' });
    // console.log('===', res);
  };

  _fast = () => {
    Accelerometer.setUpdateInterval(500);
  };

  _subscribe = () => {
    this._subscription = Accelerometer.addListener(result => {
      // this._handlePlaySoundAsync(result.y * 3)

      styles.sensor.backgroundColor = '#1dd';
      this.setState({ accelerometerData: result });
      const me = Meteor.collection('phones').findOne({ sessionId: Constants.sessionId });
      const lastUpdated = new Date();
      if (me) {
        Meteor.collection('phones').update(
          me._id,
          {
            accelerometerData: result,
            phoneName: '1',
            sessionId: Constants.sessionId,
            lastUpdated
          },
          // (cberror, cbresult) => {
          //   console.log('err:', xcberror, ' cbresult', cbresult);
          // }
        );
      } else {
        console.error("couldnt find me");
      }
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  render() {
    let { x, y, z } = this.state.accelerometerData;
    let colorx = round(x * 100) + 101;
    let colory = round(y * 100) + 101;
    let colorz = round(z * 100) + 101;

    const angle = Math.round(y * 90);
    let note = '-';
    if (angle > 54) {
      note = 'G4';
    } else if (angle > 18) {
      note = 'F4';
    } else if (angle > -18) {
      note = 'E4';
    } else if (angle > -54) {
      note = 'D4';
    } else {
      note = 'C4';
    }

    let colorStyle = StyleSheet.create({
      colors: { backgroundColor: `rgb(${colorx},${colory},${colorz})` }
    });
    return (
      <View style={colorStyle.colors}>
        <Text>Accelerometer:</Text>
        <Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>
        <KeepAwake />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this._toggle} style={styles.button}>
            <Text>Toggle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._slow}
            style={[styles.button, styles.middleButton]}
          >
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
        <Text sytle={colorStyle.colors}> {angle} </Text>
        <Text sytle={colorStyle.colors}> {note} </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
        <Text sytle={colorStyle.colors}> </Text>
      </View>
    );
  }
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc'
  },
  sensor: {
    marginTop: 15,
    paddingHorizontal: 10
  }
});

Expo.registerRootComponent(
  createContainer(params => {
    return {
      phones: Meteor.collection('phones').find()
    };
  }, AccelerometerSensor)
);
