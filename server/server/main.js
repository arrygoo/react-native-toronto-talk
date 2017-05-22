import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Phones = new Mongo.Collection('phones');

Meteor.startup(() => {
  Phones.upsert({ phoneName: '1' }, { position: 0, phoneName: '1' });
  // code to run on server at startup
});
