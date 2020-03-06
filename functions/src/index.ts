import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

import * as customerDatabase from './database/customer';
import * as menuDatabase from './database/menu';
import * as onboardingDatabase from './database/onboarding';
import * as orderDatabase from './database/order';
import * as kalinka_commands from './kalinka-commands';
import * as messages from './messages';
import { cleanString } from './util';
import { KeyedOrder } from './models/order';

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
});

export const kalinka = functions.https.onRequest(main);


const accountSid = 'AC80f1fa9d1000a17cf22791eda3bc46a6';
const authToken = '0193b4caedd3d0d650ac112a015cff90';
const client = require('twilio')(accountSid, authToken);
export const notifyCustomer = functions.database
    .ref("/orders/{orderId}/reply").onCreate(async (snapshot, context) => {
        const kalinkaResponse = snapshot.val();
        const orderId = context.params.orderId;
        const currentOrder: KeyedOrder = 
            await orderDatabase.getOrderFromOrderId(orderId);
        client.messages
            .create({
               from: 'whatsapp:+14155238886',
               body: kalinkaResponse,
               to: currentOrder.order.userId
             })
            .then((message: String) => console.log(message)).catch((error: any) => {
                console.log(error);
            });
    })

export const twilio = functions.https.onRequest((req, resp) => {
    client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hello there!',
         to: 'whatsapp:+16193652914'
       })
      .then((message: String) => console.log(message)).catch((error: any) => {
          console.log(error);
      });
    resp.end("finished");
});
