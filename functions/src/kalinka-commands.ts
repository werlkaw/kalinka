import * as customerDatabase from './database/customer';
import * as menuDatabase from './database/menu';
import * as orderDatabase from './database/order';
import * as messages from './messages';
import { RegisteredUserMessage } from "./models/user";

const FuzzyMatching = require('fuzzy-matching');
const commands = ['menu', 'pedido', 'terminar', 'cancelar', 'olvidar'];

export async function processCommand(userMessage: RegisteredUserMessage):
  Promise<string> {
    const command = detectCommand(userMessage);
    if (command === 'menu') {
        return printFullMenu();
    } else if (command === 'pedido') {
        return messages.ORDER_INSTRUCTIONS;
    } else if (command === 'terminar') {
        return await finishOrderCommand(userMessage.id);
    } else if (command === 'cancelar') {
        return cancelOrderCommand(userMessage.id);
    } else if (command === 'olvidar') {
        customerDatabase.removeCustomer(userMessage.id);
        cancelOrderCommand(userMessage.id);
        return messages.ERASE_ALL_DATA;
    } else {
        console.log('detecting order');
        return detectOrder(userMessage);
    }
}

async function cancelOrderCommand(userId: string): Promise<string> {
    const keyedOrder = await orderDatabase.getOpenOrder(userId);
    if (keyedOrder !== null) {
        await orderDatabase.cancelOpenOrder(keyedOrder);
        return messages.ORDER_CANCELLED;
    } else {
        return messages.NO_OPEN_ORDERS;
    }
}

async function finishOrderCommand(userId: string): Promise<string> {
    const keyedOrder = await orderDatabase.getOpenOrder(userId);
    if (keyedOrder !== null) {
        await orderDatabase.completeOpenOrder(keyedOrder);
        return messages.completedOrderMessage(keyedOrder.order);
    } else {
        return messages.NO_OPEN_ORDERS;
    }
}

async function printFullMenu(): Promise<string> {
    const menuItems = await menuDatabase.getMenuItems();
    return messages.toMenuMessage(menuItems);
}

async function detectOrder(userMessage: RegisteredUserMessage):
  Promise<string> {
    const orderParts = userMessage.message.split(' ');
    const openOrder = await orderDatabase.getOpenOrder(userMessage.id);
    if (orderParts.length !== 2 || isNaN(Number(orderParts[0]))) {
        if (openOrder !== null) {
            return messages.FIX_YOUR_ORDER;
        } else {
            return messages.OPTIONS;
        }
    } else if (openOrder !== null) {
        console.log("order exists");
        orderDatabase.addItemToOrder(openOrder,
                                     orderParts[1],
                                     Number(orderParts[0])).then().catch();
    } else {
        console.log("order does not exist");
        const newOrder = await orderDatabase.createOrder(userMessage.id);
        orderDatabase.addItemToOrder(newOrder,
                                     orderParts[1],
                                     Number(orderParts[0])).then().catch();

    }
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