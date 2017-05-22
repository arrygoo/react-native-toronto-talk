import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'));
});
//
// import { Template } from 'meteor/templating';
// import { ReactiveVar } from 'meteor/reactive-var';
//
// import './main.html';
// const Phones = new Mongo.Collection('phones');
//
// Template.hello.onCreated(function helloOnCreated() {
//   // counter starts at 0
//   this.counter = new ReactiveVar(0);
// });
//
// Template.hello.helpers({
//   accelerometerData() {
//     const phones = Phones.findOne({ 'phoneName': '1' });
//     console.log(phones);
//     const accelerometerData =  phones && phones.accelerometerData && phones.accelerometerData;
//     return accelerometerData && {
//       x: Math.round(accelerometerData.x * 100),
//       y: Math.round(accelerometerData.y * 100),
//       z: Math.round(accelerometerData.z * 100)
//     }
//   },
// });
//
// Template.hello.events({
//   'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
//   },
// });
