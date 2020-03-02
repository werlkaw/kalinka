import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

import * as customerDatabase from './database/customer';
import * as menuDatabase from './database/menu';
import * as onboardingDatabase from './database/onboarding';
import * as kalinka_commands from './kalinka-commands';
import * as messages from './messages';
import { cleanString } from './util';

const MessagingResponse = require('twilio').twiml.MessagingResponse;

/* Express */
const main = express();
const api = express();

api.get('*', (req, resp) => {
    resp.send('api is working!');
});

main.use('/api/v1', api);
main.post('/twilio', async (req, resp) => {
    const userId: string = req.body['From'];
    const message: string = cleanString(req.body['Body']);

    const twilioResponse = new MessagingResponse();
    if (userId === undefined) {
        resp.send("no phone");
        return;
    }

    if (message === 'addCustomer') {
        customerDatabase.registerCustomer(userId, message);
    }
    if (userId === 'addMenuItem') {
        const menuItem = message.split(',');
        menuDatabase.addMenuItem(menuItem[0], Number.parseInt(menuItem[1]));
        resp.end("added item!");
        return;
    }
    if (await customerDatabase.isRegistered(userId)) {
        const customerName = await customerDatabase.getCustomerName(userId);
        twilioResponse.message(await kalinka_commands.processCommand({
            id: userId,
            name: customerName,
            message: message
        }))
    } else if (await onboardingDatabase.isOnboarding(userId)) {
        customerDatabase.registerCustomer(userId, message);
        twilioResponse.message(messages.newCustomerMessage(message));
    } else {
        onboardingDatabase.startOnboarding(userId);
        twilioResponse.message(messages.NOT_REGISTERED);
    }
    resp.end(twilioResponse.toString());
    // resp.send("oops");
    // resp.end();
    // return;
    // if (match.distance < .5) {
    //     resp.send("didn't understand");
    // } else if (match.value === 'menu') {
    //     resp.send("menu");
    // } else if (match.value === 'pedido') {
    //     resp.send("pedido");
    // } else if (match.value === 'terminar') {
    //     resp.send("terminar");
    // } else if (match.value === 'cancelar') {
    //     resp.send("cancelar");
    // } else if (match.value === 'olvidar') {
    //     resp.send("olvidar");
    // } else {
    //     resp.send("else");
    // }
    // resp.end();
    // return;
    // twilioResponse.message(`I saw: ${message} from ${phone}`);

    // resp.writeHead(200, {'Content-Type': 'text/xml'});
    // resp.end(twilioResponse.tostring());
});

export const kalinka = functions.https.onRequest(main);
