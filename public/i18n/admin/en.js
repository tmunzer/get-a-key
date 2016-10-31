var en = {
    logout: "Logout",
    language: "Langue",
    save: "Save",
    enabled: "Enabled",
    disabled: "Disabled",
    config: {
        config: "Configuration",
        loginUrl: "LoginURL (to configure the CWP):",
        userAccount: "User Account",
        userGroup: "User Group",
        concurrentSessions: "Maximum number of concurent sessions configured in the SSID (0=disabled)"
    },
    custom: {
        custom: "Customization",
        logo: "Logo",
        headerLogo: "Header Logo",
        loginLogo: "Login Logo",
        color: {
            color: "Colors"
        },
        login: {
            login: "Login page",
            title: "Title",
            text: "Text"
        },
        app: {
            app: "Application page",
            messages: "Messages",
            iconSrc: "This Application is using predifiened \"material design\" icons. You can find the entire list at ",
            title: "Title",
            icon: "Icon",
            text: "Text"
        }
    },
    authentication: {
        authentication: "Authentication",
        method: "Authentication method",
        azureAd: {
            azureAd: "Azure AD",
            params: "Azure AD configuration",
            clientID: "Application ID",
            clientSecret: "Application Key",
            tenant: "Tenant",
            resource: "Resource",
            signinURL: "Signin URL:",
            callbackURL: "Callback URL:",
            logoutURL: "logoutURL:",
        },
        adfs: {
            adfs: "AD Federation Service",
            params: "ADFS configuration"
        },
        modal: {
            save_title: "Save changes?",
            disable_message: "Warning. ",
            confirm: {
                title: "Confirmation Needed",
                message_delete: "Are you sure you want to delete your key?",
            },
            notFound: {
                title: "No Key Found",
                message_notFound: "No key found for user {{email}}.",
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
                yes: "Yes"
            }
        }
    },
    modal: {
        confirm: {
            title: "Confirmation Needed",
            message_delete: "Are you sure you want to delete your key?",
        },
        notFound: {
            title: "No Key Found",
            message_notFound: "No key found for user {{email}}.",
        },
        error: {
            title: "Error!",
            logoFileTooLarge: "The file \"{{name}}\" (size: {{size}}{{unit}}) is too large. Please select a file smaller than 1MB."
        },
        done: {
            title: "Finished!",
            message_created: "A new key has been generated. You will receive it at {{email}}.",
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
            yes: "Yes"
        }
    },
}