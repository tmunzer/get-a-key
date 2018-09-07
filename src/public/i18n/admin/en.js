var en = {
    logout: "Logout",
    language: "language",
    save: "Save",
    enabled: "Enabled",
    disabled: "Disabled",
    config: {
        config: "Configuration",
        portalAccess: "Your Portal Access",
        loginUrl: "URL to get access to your Login Page (to configure the CWP):",
        userAccount: "Corporate Accounts",
        guestAccount: "Guest Accounts",
        userAccountInfo: "Allow corporate users to request a Network Access",
        guestAccountInfo: "Allow corporate users to create Guest Accounts",
        userGroup: "User Group",
        customizeDefaultPhonePrefix: "Customize default phone number prefix",
        note: "NOTE:",
        corp_1: "If this option is enabled, Corporate users can request for a personnal key (for BYOD devices for example).",
        corp_2: "A Corporate user can have only ONE key at a time. If a user a requesting for a new key, the previous one will be revoked.",
        guest_1: "If this option is enabled, Corporate users can request for a key for their GUEST.",
        guest_2: "A Corporate user can generate multiple Guest key.",
        guest_3: "It's your responsability to configure the User Group with lifetime limited accounts."
    },
    custom: {
        custom: "Customization",
        logo: {
            logo: "Logos",
            header: "Header Logo",
            login: "Login Page Logo"
        },
        headerLogo: "Header Logo",
        loginLogo: "Login Logo",
        preview: "Preview",
        color: {
            color: "Colors",
            theme: "Theme",
            mainColor: "Main Color",
            light: "Light",
            dark: "Dark"
        },
        login: {
            login: "Login page",
            title: "Title",
            text: "Text"
        },
        app: {
            app: "Application Frame for Corporate keys",
            app_guest: "Application Frame for Guest keys",
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
            external: "Allow External Users to get a key",
            unlicensed: "Allow Users without license",
            groupsFilter: "Only authorize users belonging to the following user groups"
        },
        adfs: {
            adfs: "AD Federation Service",
            params: "ADFS configuration",
            getAdfsMetadata: "Download ADFS Metadata",
            pasteAdfsMetadata: "Paste ADFS Metadata",
            getAppCertificate: "Download Get-A-Key Certificate",
            server: "ADFS Server FQDN"
        },
    },
    modal: {
        save: {
            title: "Saved",
            configuration: "New configuration saved.",
            authentication: "New authentication parameters saved.",
            customization: "Customization saved."
        },
        error: {
            title: "Error!",
            logoFileTooLarge: "The file \"{{name}}\" (size: {{size}}{{unit}}) is too large. Please select a file smaller than 1MB."
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