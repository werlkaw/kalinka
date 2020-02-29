import * as admin from 'firebase-admin';
import { MenuItem } from '../models/menuItem';

export function addMenuItem(name: string, price: number) {
    const menu = admin.database().ref('menu');
    menu.push({
        name: name,
        price: price
    }).then().catch();
}

export async function getMenuItems(): Promise<any> {
    const menuRef = admin.database().ref('menu');
    const snapshot = await menuRef.once('value');
    let menuItems: MenuItem[] = [];
    for (const key in snapshot.val()) {
        console.log("this is the value: " + JSON.stringify(snapshot.val()[key]));
        menuItems.push(snapshot.val()[key]);
    }
    return menuItems;
}