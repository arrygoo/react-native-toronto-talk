import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

const Phones = new Mongo.Collection('phones');

Meteor.startup(() => {
  // code to run on server at startup
});
