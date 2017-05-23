import React, { Component, PropTypes } from 'react';
// import { Instrument, Note } from 'react-orchestra/web';
// TODO: make a function that converts notes to degrees and reverse
// Use them to tell the user which degree to put
import Task from './Task.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import { Layer, Rect, Stage, Group, Line } from 'react-konva';
import Tone from 'tone';
import _ from 'lodash';

const Phones = new Mongo.Collection('phones');
const AppInfo = new Mongo.Collection('appInfo');

const OdeToJoy =
	'EEFG GFED CCDE EDDD EEFG GFED CCDE DCCC' +
	' DDEC DFEC DFED CDGG EEFG GFED CCDE DCCC';
// const OdeToJoy = 'EEFG';
const OdeToJoyNotes = OdeToJoy.replace(/\s/g, '').split('');

// App component - represents the whole app
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			turn: 0
		};
	}

	componentDidMount() {
		// this.startPlaying();
		this.startPlaying = this.startPlaying.bind(this);
	}

	whoIsOnline() {
		const tenSecondsAgo = new Date(new Date() - 10000);
		return Phones.find(
			{ lastUpdated: { $gt: tenSecondsAgo } },
			{ sort: { sessionId: 1 } }
		).fetch();
	}

	getPhone() {
		const phones = Phones.findOne({});
		if (phones && phones.accelerometerData) {
			return {
				x: Math.round(phones.accelerometerData.x * 100),
				y: Math.round(phones.accelerometerData.y * 100),
				z: Math.round(phones.accelerometerData.z * 100)
			};
		}
	}

	constructPlayingArray() {
		const playingArray = _.map(OdeToJoyNotes, (note, i) => {
			return {
				note,
				turn: i,
				sessionId: this.getNthUser(i).sessionId
			};
		});
		console.log('playingArray', playingArray);
		return playingArray;
	}

	startPlaying() {
		this.updateMockedPhone1();
		this.updateMockedPhone2();
		// this.updateMockedPhone3();
		// this.updateMockedPhone4();

		console.log('clicked');
		const appInfoDoc = AppInfo.findOne({ name: 'appInfo' });
		console.log('found app info', appInfoDoc);
		AppInfo.update(appInfoDoc && appInfoDoc._id, {
			$set: {
				name: 'appInfo',
				turn: 0,
				playingArray: this.constructPlayingArray()
			}
		});
		// create a synth and connect it to the master output (your speakers)
		var synth = new Tone.Synth().toMaster();

		//play a note every quarter-note
		var loop = new Tone.Loop(time => {
			this.updateMockedPhone1();
			this.updateMockedPhone2();
			// this.updateMockedPhone3();
			// this.updateMockedPhone4();

			const phone = Phones.findOne({ sessionId: this.currentSessionId() });
			let note = (phone && phone.note) || 'A4';
			const angle = (phone && phone.angle) || 0;
			console.log(phone, note, angle);
			// if (this.state.turn % 2 || this.state.turn < 3) {
			if (this.state.turn < 3) {
				// if (true) {
				note = (OdeToJoyNotes[this.state.turn] || 'A') + '3';
			} else {
				note = note + '3';
			}
			AppInfo.update(appInfoDoc && appInfoDoc._id, {
				$set: {
					turn: this.state.turn
				}
			});

			this.setState((prevState, props) => ({ turn: prevState.turn + 1 }));
			synth.triggerAttackRelease(note, '0.9', time);
		}, '1');
		//loop between the first and fourth measures of the Transport's timeline
		loop.start('1m').stop('32m');
		Tone.Transport.start();
	}

	userCount() {
		return this.whoIsOnline().length;
	}

	getNthUser(n) {
		const turn = this.state.turn + n;
		const people = this.whoIsOnline();
		const count = this.userCount();
		const personTurn = turn % count;
		return people[personTurn];
	}

	currentUser() {
		return this.getNthUser(0);
	}

	nextUser() {
		return this.getNthUser(1);
	}

	currentSessionId() {
		// TODO: Move to state?
		return this.currentUser() && this.currentUser().sessionId;
	}

	currentCorrectNote() {
		if (this.state.turn <= OdeToJoyNotes.length) {
			return OdeToJoyNotes[this.state.turn];
		}
	}

	isCorrectNote() {
		if (!this.currentUser()) return false;
		if (OdeToJoyNotes[this.state.turn] === this.currentUser().note) {
			return true;
		} else {
			console.log(
				'wrong user',
				OdeToJoyNotes[this.state.turn],
				this.currentUser()
			);
		}
	}

	updateMockedPhone1() {
		const angle = 0;
		const note = this.currentCorrectNote();
		const lastUpdated = new Date();
		const sessionId = 'mock1';
		Phones.upsert('mock1', {
			name: sessionId,
			sessionId,
			angle,
			note,
			lastUpdated
		});
	}
	updateMockedPhone2() {
		const angle = 0;
		const note = this.currentCorrectNote();
		const lastUpdated = new Date();
		const sessionId = 'mock2';
		Phones.upsert('mock2', {
			sessionId,
			angle,
			note,
			lastUpdated
		});
	}
	updateMockedPhone3() {
		const angle = 0;
		const note = this.currentCorrectNote();
		const lastUpdated = new Date();
		const sessionId = 'mock3';
		Phones.upsert('mock3', {
			sessionId,
			angle,
			note,
			lastUpdated
		});
	}
	updateMockedPhone4() {
		const angle = 0;
		const note = this.currentCorrectNote();
		const lastUpdated = new Date();
		const sessionId = 'mock4';
		Phones.upsert('mock4', {
			sessionId,
			angle,
			note,
			lastUpdated
		});
	}

	nextCorrectNote() {
		if (this.state.turn < OdeToJoyNotes.length) {
			return OdeToJoyNotes[this.state.turn + 1];
		}
	}

	render() {
		return (
			<div className="container">
				<header>
					<h1>React-native + expo.io + Meteor </h1>
				</header>
				<button onClick={this.startPlaying}> Start Playing! </button>

				Current person:&nbsp;

				{(this.isCorrectNote() && '      ✅') || '      ⛔'}

				Note number:{this.state.turn}
				<br />
				<br />

				Name: {this.currentUser() && this.currentUser().name}
				<br />
				ID: {this.currentSessionId()}
				<br />
				Note: {this.currentUser() && this.currentUser().note}
				<br />
				Degree: {this.currentUser() && this.currentUser().angle}
				<br />
				Correct Note: {this.currentCorrectNote()}
				<br />
				<br />

				Next person:&nbsp;
				<br />

				Name: {this.nextUser() && this.nextUser().name}
				<br />
				Note: {this.nextUser() && this.nextUser().note}
				<br />
				Degree: {this.nextUser() && this.nextUser().angle}
				<br />
				Correct Note: {this.nextCorrectNote()}

				<br />
				People Online:
				<ul>
					{this.whoIsOnline().map(person => (
						<li key={person.sessionId}>
							UserSessionId: {person.sessionId}
							<br />
							Name: {person.name}
							<br />
							Current Note: {person.note}
							Current Degree: {person.angle}
							<br />
							<br />
						</li>
					))}
				</ul>
			</div>
		);
	}
}

export default createContainer(() => {
	return {
		phones: Phones.find({}).fetch()
	};
}, App);
