import React from 'react';
import Expo, { Sound, Audio, Accelerometer, KeepAwake, Constants } from 'expo';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import generateName from 'sillyname';
import _ from 'lodash';
Meteor.connect('ws://192.168.1.4:3000/websocket'); //do this only once

const noteToDegree = noteString => {
	switch (noteString) {
		case 'G':
			return '75';
			break;
		case 'F':
			return '45';
			break;
		case 'E':
			return '0';
			break;
		case 'D':
			return '-45';
			break;
		case 'C':
			return '-75';
			break;
		default:
			return '0';
	}
};

class AccelerometerSensor extends React.Component {
	state = {
		color: '100',
		accelerometerData: {},
		note: 'A4',
		angle: 0,
		name: '----'
	};

	getAppInfo() {
		return Meteor.collection('appInfo').findOne({});
	}
	componentDidMount() {
		Accelerometer.setUpdateInterval(300);
		this._toggle();
		this.registerPhone();
	}

	registerPhone() {
		console.log('Registering phone', Constants.sessionId);
		const name = generateName();
		this.setState({ name });
		Meteor.collection('phones').insert({
			sessionId: Constants.sessionId,
			name
		});
	}

	componentWillUnmount() {
		this._unsubscribe();
	}

	getMyNextNote() {
		if (!this.getAppInfo()) return;
		const turn = this.getAppInfo().turn;
		const playingArray = this.getAppInfo().playingArray;
		const foundItem = _.find(playingArray, item => {
			return item.sessionId === Constants.sessionId && item.turn >= turn;
		});
		console.log('==', turn);
		return (foundItem && foundItem.note) || 'N/A';
	}

	getMyNextTurn() {
		if (!this.getAppInfo() || !this.getAppInfo().turn) return;
		const turn = this.getAppInfo().turn;
		const playingArray = this.getAppInfo().playingArray;
		const foundItem = _.find(playingArray, item => {
			return item.sessionId === Constants.sessionId && item.turn >= turn;
		});
		console.log('==', turn);
		return (foundItem && foundItem.turn) || 'N/A';
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
		this._subscription = Accelerometer.addListener(accelerometerData => {
			if (Constants.platform && Constants.platform.ios) {
				accelerometerData.y *= -1;
			}

			styles.sensor.backgroundColor = '#1dd';

			// Calculate Angle and Note
			const angle = Math.round(accelerometerData.y * 90);
			let note = 'B';
			if (angle > 54) {
				note = 'G';
			} else if (angle > 18) {
				note = 'F';
			} else if (angle > -18) {
				note = 'E';
			} else if (angle > -54) {
				note = 'D';
			} else {
				note = 'C';
			}

			// Set accelerometerData and angle
			this.setState({ accelerometerData, angle, note });

			// Update database
			const me = Meteor.collection('phones').findOne({
				sessionId: Constants.sessionId
			});
			const lastUpdated = new Date();
			if (me) {
				Meteor.collection('phones').update(
					me._id,
					{
						$set: {
							accelerometerData,
							sessionId: Constants.sessionId,
							angle,
							note,
							lastUpdated
						}
					}
					// (cberror, cbresult) => {
					//   console.log('err:', xcberror, ' cbresult', cbresult);
					// }
				);
			} else {
				console.error('couldnt find me');
			}
		});
	};

	_unsubscribe = () => {
		this._subscription && this._subscription.remove();
		this._subscription = null;
	};

	isCorrectNote = () => {
		return this.getMyNextNote() === this.state.note;
	};

	render() {
		let { x, y, z } = this.state.accelerometerData;
		// let colorx = round(x * 100) + 101;
		// let colory = round(y * 100) + 101;
		// let colorz = round(z * 100) + 101;
		let backgroundColor = (this.isCorrectNote() && 'green') || 'red';

		let colorStyle = StyleSheet.create({
			// colors: { backgroundColor: `rgb(${colorx},${colory},${colorz})` },
			colors: { backgroundColor },
			largeText: { fontSize: 46 }
		});
		return (
			<View style={colorStyle.colors}>
				{/* <Text>Accelerometer: {JSON.stringify()}</Text> */}
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
				<Text style={colorStyle.largeText}> 📐: {this.state.angle}° </Text>
				<Text style={colorStyle.largeText}>
					{/* {(this.isCorrectNote() && '✅') || '⛔'}: {this.state.note} */}
					{(this.isCorrectNote() && '      ✅') || '      ⛔'}
				</Text>
				<Text style={colorStyle.largeText}>
					🎵:
					{/* {this.getMyNextNote()} */}
					{/* {' - '} */}
					{noteToDegree(this.getMyNextNote())}
				</Text>
				<Text style={colorStyle.largeText}> 👨‍🌾: {this.state.name} </Text>
				<Text style={colorStyle.largeText}>
					🎼: {this.getAppInfo() && this.getAppInfo().turn}
				</Text>
				<Text style={colorStyle.largeText}>
					{' '}
					🥅: {this.getMyNextTurn()}
				</Text>
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
			phones: Meteor.collection('phones').find(),
			appInfo: Meteor.collection('appInfo').find()
		};
	}, AccelerometerSensor)
);
