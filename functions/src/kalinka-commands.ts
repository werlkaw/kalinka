import * as customerDatabase from './database/customer';
import * as menuDatabase from './database/menu';
import * as messages from './messages';
import { RegisteredUserMessage } from "./models/user";

const FuzzyMatching = require('fuzzy-matching');
const commands = ['menu', 'pedido', 'terminar', 'cancelar', 'olvidar'];

export async function processCommand(userMessage: RegisteredUserMessage): Promise<string> {
    const command = detectCommand(userMessage);
    if (command === 'menu') {
        return printFullMenu();
    } else if (command === 'pedido') {
        return messages.ORDER_INSTRUCTIONS;
    } else if (command === 'terminar') {
        return '';
    } else if (command === 'cancelar') {
        return '';
    } else if (command === 'olvidar') {
        customerDatabase.removeCustomer(userMessage.id);
        return messages.ERASE_ALL_DATA;
    } else {
        return detectOrder(userMessage);
    }
}

async function printFullMenu(): Promise<string> {
    const menuItems = await menuDatabase.getMenuItems();
    return messages.toMenuMessage(menuItems);
}

function detectOrder(userMessage: RegisteredUserMessage): string {
    return '';
}

function detectCommand(userMessage: RegisteredUserMessage): string {
    const fm = new FuzzyMatching(commands);
    const match = fm.get(userMessage.message);
    if (match.distance <= 0.65) {
        console.log('Distance was too big. Message: ' + userMessage.message);
        return '';
    } else {
        console.log('Understood command: ' + match.value);
        return match.value;
    }
}