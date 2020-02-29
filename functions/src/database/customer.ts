import * as admin from 'firebase-admin';
import * as onboarding from './onboarding';

// Assumes firebase app is already initialized.
export async function isRegistered(userId: string): Promise<boolean> {
    const customer = admin.database().ref('customers').child(userId);
    const snapshot = await customer.once('value');
    return snapshot.exists();
};

export function registerCustomer(userId: string, userName: string) {
    const customers = admin.database().ref('customers').child(userId);
    customers.set({
        'name': userName
    }).then((v) => {
        onboarding.removeFromOnboarding(userId);
    }).catch();
}

export async function getCustomerName(userId: string): Promise<string> {
    const customer = admin.database().ref('customers').child(userId);
    const snapshot = await customer.once('value');
    return snapshot.val()['name'];

}