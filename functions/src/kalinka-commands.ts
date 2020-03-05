import * as customerDatabase from './database/customer';
import * as menuDatabase from './database/menu';
import * as orderDatabase from './database/order';
import * as messages from './messages';
import { RegisteredUserMessage } from "./models/user";
import { MenuItem } from './models/menuItem';

const FuzzyMatching = require('fuzzy-matching');
const commands = ['menu', 'pedido', 'terminar', 'cancelar', 'olvidar'];

export async function processCommand(userMessage: RegisteredUserMessage):
  Promise<string> {
    const command = fuzzyMatch(commands, userMessage.message);
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
        cancelOrderCommand(userMessage.id).then().catch();
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
    let openOrder = await orderDatabase.getOpenOrder(userMessage.id);
    const menuItem = await detectMenuItem(orderParts[1]);
    if (menuItem === null || orderParts.length !== 2 ||
        isNaN(Number(orderParts[0]))) {
        if (openOrder !== null) {
            return messages.FIX_YOUR_ORDER;
        } else {
            return messages.OPTIONS;
        }
    } else if (openOrder === null) {
        console.log('creating order');
        openOrder = await orderDatabase.createOrder(userMessage);
    }
    const quantity = Number(orderParts[0]);
    orderDatabase.addItemToOrder(openOrder,
                                pluralizeMenuItem(menuItem, quantity),
                                quantity).then().catch();

    return messages.continueOrderMessage({
        menuItem: menuItem,
        quantity: Number(orderParts[0])
    });
}

function pluralizeMenuItem(menuItem: string, quantity: Number): string {
    return quantity > 1 ? menuItem + "s" : menuItem;
}

async function detectMenuItem(menuOrder: string): Promise<string | null> {
    const menu: MenuItem[] = await menuDatabase.getMenuItems();
    const menuItemNames: string[] = [];
    menu.forEach((item) => {
        menuItemNames.push(item.name);
    });
    return fuzzyMatch(menuItemNames, menuOrder);
}

function fuzzyMatch(lst: string[], elem: string): string | null {
    const fm = new FuzzyMatching(lst);
    const match = fm.get(elem);
    if (match.distance <= 0.65) {
        return null;
    } else {
        return match.value;
    }
}