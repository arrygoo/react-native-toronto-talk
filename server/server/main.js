import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Phones = new Mongo.Collection('phones');
const AppInfo = new Mongo.Collection('appInfo');

Meteor.startup(() => {
	console.log('Starting');
	const appinfo = AppInfo.findOne({ name: 'appInfo' });
	if (!appinfo) {
		console.log('Making app info');
		AppInfo.insert({ name: 'appInfo' });
	} else {
		console.log('Already has app info', appinfo);
	}
	// code to run on server at startup
});
