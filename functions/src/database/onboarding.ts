import * as admin from 'firebase-admin';

const onboardingRef = admin.database().ref('onboarding');

export async function isOnboarding(userId: string): Promise<boolean> {
    const onboarding = onboardingRef.child(userId);
    const snapshot = await onboarding.once('value');
    return snapshot.exists();
};

export function removeFromOnboarding(userId: string) {
    const onboarding = onboardingRef.child(userId);
    onboarding.remove().then().catch();
}

export function startOnboarding(userId: string) {
    const onboarding = onboardingRef.child(userId);
    onboarding.set({
        onBoarding: true
    }).then().catch();
}