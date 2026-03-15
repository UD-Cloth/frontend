// SMS notification service — calls backend API
// NOTE: This is a mock implementation. In production, create a backend
// endpoint (e.g. POST /api/notifications/sms) to send SMS via a provider
// like Twilio, MSG91, or AWS SNS.

export const sendSMSNotification = async (phone: string, message: string): Promise<boolean> => {
    try {
        console.log(`Sending SMS to ${phone}...`);

        // Simulate network delay to backend
        await new Promise(resolve => setTimeout(resolve, 600));

        console.log(`[Mock SMS Success]: Sent to ${phone}. Message block: ${message.substring(0, 30)}...`);
        return true;
    } catch (error) {
        console.error("Failed to send SMS:", error);
        return false;
    }
};
