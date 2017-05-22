import React, { Component, PropTypes } from 'react';
// import { Instrument, Note } from 'react-orchestra/web';

import Task from './Task.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import { Layer, Rect, Stage, Group, Line } from 'react-konva';
import Tone from 'tone';
const Phones = new Mongo.Collection('phones');

// const phones = Phones.findOne({ 'phoneName': '1' });
// const accelerometerData =  phones && phones.accelerometerData && phones.accelerometerData;
// return accelerometerData && {
//   x: Math.round(accelerometerData.x * 100),
//   y: Math.round(accelerometerData.y * 100),
//   z: Math.round(accelerometerData.z * 100)
// }

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    //create a synth and connect it to the master output (your speakers)
    var synth = new Tone.Synth().toMaster();

    //play a note every quarter-note
    var loop = new Tone.Loop(function(time){
      let note = 'B4';
      const phone = Phones.findOne({ phoneName: '1' })
      if (phone.accelerometerData && phone.accelerometerData.y) {
        const y = phone.accelerometerData.y
        const angle = Math.round(y*90);
        if (angle > 54) {
          note = 'G3';
        } else if (angle > 18) {
          note = 'F3';
        } else if (angle > -18) {
          note ='E3';
        } else if (angle > -54 ) {
          note ='D3';
        } else {
          note ='C3';
        }
      }
      console.log("time:", time, note);
    	synth.triggerAttackRelease(note, "0.9", time);
    }, "1");
    //loop between the first and fourth measures of the Transport's timeline
    loop.start("1m").stop("20m");
    Tone.Transport.start();
  }
  whoIsOnline() {
    const tenSecondsAgo = new Date(new Date() - 10000);
    return Phones.find({ lastUpdated: {$gt: tenSecondsAgo }}).fetch();
  }

  getPhone() {
    const phones = Phones.findOne({ phoneName: '1' });
    if (phones && phones.accelerometerData) {
      return (
         {
          x: Math.round(phones.accelerometerData.x * 100),
          y: Math.round(phones.accelerometerData.y * 100),
          z: Math.round(phones.accelerometerData.z * 100)
        }
      );
    }

  }

  render() {
    const x = this.getPhone() && this.getPhone().x;
    const y = this.getPhone() && this.getPhone().y;
    const angle = this.getPhone() && this.getPhone().y && Math.round(this.getPhone().y * 90 / 100);


    return (
      <div className="container">
        <header>
          <h1>Todo List, Degree: {angle}</h1>
        </header>

        <Stage width={500} height={500}>
          <Layer>
            {/* <Rect x={10} y={x} width={50} height={50} fill="green" /> */}
            <Line
              x={100}
              y={400}
              points={[0, 0, 400, 0]}
              stroke="red"
              rotation={-(y / 100 * 90)}
              tension={100}
            />

          </Layer>
        </Stage>
        People Online:
        <ul>
          {this.whoIsOnline().map( person =>
            <div key={person.sessionId}> {person.sessionId} </div>
          )}
          {/* x: {this.getPhone() && this.getPhone().x} 
          y: {this.getPhone() && this.getPhone().y}
          z: {this.getPhone() && this.getPhone().z} */}
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
