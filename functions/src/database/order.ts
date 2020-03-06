import * as admin from 'firebase-admin';
import { Order, KeyedOrder } from '../models/order';
import { RegisteredUserMessage } from '../models/user';

const orderRef = admin.database().ref('orders');

export async function getOpenOrder(userId: string): Promise<KeyedOrder | null> {
    const order = orderRef.orderByChild('expiration')
                    .startAt(Date.now());
    const snapshot = await order.once('value');
    for (const key in snapshot.val()) {
        const currentOrder: Order = snapshot.val()[key];
        // If order is completed and owned by userId.
        if (!currentOrder.completed && currentOrder.userId === userId) {
            return {
                key: key,
                order: snapshot.val()[key]
            };
        }
    }
    return null;
}

export async function getOrderFromOrderId(orderId: string): Promise<KeyedOrder> {
    const snapshot = await orderRef.child(orderId).once('value');
    return {
        key: orderId,
        order: snapshot.val()
    }
}

export async function createOrder(userMessage: RegisteredUserMessage):
    Promise<KeyedOrder | null> {
    const newOrder: Order = {
        userId: userMessage.id,
        userName: userMessage.name,
        completed: false,
        expiration: Date.now() + 86400000,
        items: []
    };
    const insertedKey: string | null = orderRef.push(newOrder).key;
    if (insertedKey === null) {
        return null;
    } else {
        return {
            key: insertedKey,
            order: newOrder
        };
    }
}

export async function addItemToOrder(
    keyedOrder: KeyedOrder | null, orderItem: string, quantity: number) {
    if (keyedOrder !== null) {
        const order = orderRef.child(keyedOrder.key);
        const currentItems = keyedOrder.order.items;
        currentItems.push({
            menuItem: orderItem,
            quantity: quantity
        });
        order.update({
            items: currentItems
        }).then().catch();
    }
}

export async function completeOpenOrder(keyedOrder: KeyedOrder): 
    Promise<KeyedOrder> {
    const order = orderRef.child(keyedOrder.key);
    order.update({
        completed: true
    }).then().catch();
    var message = {
        notification: {
          title: 'Kalinka App',
          body: 'Llegó un nuevo pedido!',
        },
        topic: 'kalinka'
    };
    admin.messaging().send(message).then().catch();
    return keyedOrder;
}

export async function cancelOpenOrder(keyedOrder: KeyedOrder) {
    const order = orderRef.child(keyedOrder.key);
    order.remove().then().catch();
}