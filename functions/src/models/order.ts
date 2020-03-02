export type Order = {
    userId: string,
    completed: boolean,
    expiration: number,
    items: OrderItem[],
}

export type KeyedOrder = {
    key: string,
    order: Order
}

export type OrderItem = {
    menuItem: string,
    quantity: number
}

export function orderToString(order: Order) {
    const currentOrderItems: string[] = [];
    order.items.forEach((item) => {
        currentOrderItems.push(item.menuItem + " x " + item.quantity);
    });
    return currentOrderItems.join("\n");
}