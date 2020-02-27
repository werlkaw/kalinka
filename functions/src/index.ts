import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from 'express';

admin.initializeApp(functions.config().firebase);
const MessagingResponse = require('twilio').twiml.MessagingResponse;


/* Express */
const main = express();

const api = express();
api.get('*', (req, resp) => {
    resp.send('api is working!');
});

main.use('/api/v1', api);
main.post('/twilio', (req, resp) => {
    const phone: String = req.body['From'];
    const message: String = req.body['Body'];
    const twilioResponse = new MessagingResponse();
    twilioResponse.message(`I saw: ${message} from ${phone}`);

    resp.writeHead(200, {'Content-Type': 'text/xml'});
    resp.end(twilioResponse.toString());
});

export const kalinka = functions.https.onRequest(main);
