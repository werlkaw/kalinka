import {sprintf} from 'sprintf-js';
import { MenuItem } from './models/menuItem';
import { orderToString, Order, OrderItem } from './models/order';

export const NOT_REGISTERED = 'Hola, soy un robot! Es la primera vez que' +
                              ' pides con nosotros. Por favor responde' +
                              ' con tu primer nombre solamente.';

export const ORDER_INSTRUCTIONS = 'Para hacer un pedido, manda cantidad' +
                                  ' + producto. Por ejemplo: "6 baguettes"';

export const ERASE_ALL_DATA = 'Borré toda tu información.';

export const FIX_YOUR_ORDER = 'No entendí tu orden. Por favor solo incluye la' +
                              ' cantidad y el producto. Por ejemplo: "6' +
                              ' baguettes". O para cancelar tu pedido, manda' +
                              ' "cancelar"';

export const OPTIONS = 'Para hacer un pedido, manda "pedido". Para ver el' +
                       ' menú manda "menu"';

export const NO_OPEN_ORDERS = 'No has empezado tu orden. Para ordenar, manda' +
                         ' "pedido"';

export const ORDER_CANCELLED = 'Su orden fue cancelada';

export const STORE_CLOSED = 'No se pueden hacer pedidos a esta hora. Nuestro' + 
                            ' horario de pedidos es de 10 am a 4pm de lunes a ' +
                            ' sabado.';

const COMPLETED_ORDER = 'Gracias por usar KalinkaBot. Registré tu' +
                               ' orden como:\n' +
                               '%s\n\n' +
                               'Te contactaremos cuando esté lista tu orden.';

const NEW_CUSTOMER = 'Hola, %s. Gracias por registrarte. Para hacer un' +
                     ' pedido, escribe "pedido". Para ver el menú, escribe' +
                     ' "menu".';                 

const CONTINUE_ORDER = 'Agregué: %s. Para completar tu orden, manda' +
                       ' "terminar". Si deseas cancelar tu orden, manda' +
                       ' "cancelar". Si deseas agregar otro artículo,' +
                       ' escríbelo ahora.';

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

export function completedOrderMessage(order: Order) {
    return sprintf(COMPLETED_ORDER, orderToString(order));
}

export function continueOrderMessage(orderItem: OrderItem) {
    return sprintf(CONTINUE_ORDER,
                   (orderItem.menuItem + " x " + orderItem.quantity));
}