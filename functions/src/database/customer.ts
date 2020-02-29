import * as admin from 'firebase-admin';
import * as onboarding from './onboarding';

const customerRef = admin.database().ref('customers');

// Assumes firebase app is already initialized.
export async function isRegistered(userId: string): Promise<boolean> {
    const customer = customerRef.child(userId);
    const snapshot = await customer.once('value');
    return snapshot.exists();
};

export function registerCustomer(userId: string, userName: string) {
    const customers = customerRef.child(userId);
    customers.set({
        'name': userName
    }).then((v) => {
        onboarding.removeFromOnboarding(userId);
    }).catch();
}

export async function getCustomerName(userId: string): Promise<string> {
    const customer = customerRef.child(userId);
    const snapshot = await customer.once('value');
    return snapshot.val()['name'];
}

export function removeCustomer(userId: string) {
    const customer = customerRef.child(userId);
    customer.remove().then().catch();
}