import {sprintf} from 'sprintf-js';
import { MenuItem } from './models/menuItem';

export const NOT_REGISTERED = 'Hola, soy un robot! Es la primera vez que' +
                              ' pides con nosotros. Por favor responde' +
                              ' con tu primer nombre solamente.';

export const ORDER_INSTRUCTIONS = 'Para hacer un pedido, manda cantidad' +
                                  ' + producto. Por ejemplo: "6 baguettes"';

export const ERASE_ALL_DATA = 'Borré toda tu información.';

const NEW_CUSTOMER = `Hola, %s. Gracias por registrarte. Para hacer un` +
                     ` pedido, escribe "pedido". Para ver el menú, escribe` +
                     ` "menu".`;                 

export function newCustomerMessage(name: string): string {
    return sprintf(NEW_CUSTOMER, name);
}                              

export function toMenuMessage(menuItems: MenuItem[]) {
    let outMessage = "";
    menuItems.forEach((item: MenuItem) => {
        outMessage += item.name + ": " + item.price + " pesos\n";
    });
    return outMessage;
}