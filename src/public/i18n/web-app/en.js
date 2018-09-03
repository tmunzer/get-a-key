
var en = {
    language: "Language",
    menu: "Menu",
    details: "Details",
    logout: "Logout",
    title: "Requesting a WiFi key is a one-button process",
    header: "But you need to know a few things first:",
    one: "Corporate laptops do not need a key. They are automatically configured to connect to the right network.",
    two: "Your key is yours. Do not share it with others. You're responsible for all activty that uses your key.",
    three: "If your use of our network causes problems for others you'll be disconnected.",
    four: "Each key permits up to three (3) concurrent device connections.",
    five: "If you already have a key and request another one your old key will stop working.",
    six: "Keyed networks do not have access to any internal resources. They behave as if you were using a network off-site.",
    guest_one: "Guest accounts are limited in time. Each key expires at mindnight.",
    guest_two: "You are responsible of all activiy that uses you guests keys.",
    guest_three: "Guest networks do not have access to any internal resources. They only provide internet access.",
    get: "Get a Key",
    sendByEmail: "Resend my Key (by Email)",
    sendBySMS: "Resend my Key (by SMS)",
    revoke: "Revoke my Key",
    generateGuestAccess: "Generate Guest Access",
    errorTitle: "An error occured...",
    newKeyTitle: "Here is your key!",
    successTitle: "Success!",
    revokeText: "Your key is now revoked!",
    resendText: "Your key has been sent. You should receive it soon!",

    modal: {
        confirm: {
            title: "Confirmation Needed",
            message_delete: "Are you sure you want to delete your key?",
        },
        notFound: {
            title: "No Key Found",
            message_notFound: "No key found for user {{email}}.",
        },
        done: {
            title: "Finished!",
            message_created: "A new key has been generated. You will receive it at {{email}}.",
            message_guest_created: "A new guest key has been generated. You will receive it at {{email}}.",
            message_guest_expire: "This key is valid until <b>{{time | date:'yyyy-MM-dd HH:mm (UTC Z)' }}</b>.",
            message_oldKey: "Your key has been deleted. All your devices will be disconnected from the network and you will have to reconfigure them.",
            message_yourKey: "Your personnal key: ",
            message_wifiNetwork: "Wi-Fi Network: ",
            message_delivered: "Your key has beed sent to {{email}}",
            message_deleted: "Your key has been deleted. All your devices will be disconnected from the network."
        },
        warning: {
            title: "Something went wrong...",
            instruction: "Please contact your administrator and provide these information:",
            status: "HTTP Status",
            message: "Message",
            code: "Code"
        },
        button: {
            close: 'Close',
            back: 'Back',
            cancel: "Cancel",
            yes: "Yes",
            send: "Send"
        },
        sendBySms: {
            message: "Please enter your phone number.",            
            phone: "Phone Number",
            success: "SMS sent successfully to"
        }
    },

};
