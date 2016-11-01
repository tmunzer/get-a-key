var fr = {
    logout: "Déconnexion",
    language: "Language",
    save: "Enregistrer",
    enabled: "Activé",
    disabled: "Désactivé",
    config: {
        config: "Configuration",
        loginUrl: "LoginURL (Pour configurer le portail captif):",
        userAccount: "Comptes",
        userGroup: "Groupe Utilisateurs",
        concurrentSessions: "Nombre de sessions simultanées configuré dans le SSID (0=désactivé)"
    },
    custom: {
        custom: "Personnalisation",
        logo: "Logo",
        headerLogo: "Header Logo",
        loginLogo: "Login Logo",
        preview: "Prévisualisation",
        color: {
            color: "Couleurs",
            theme: "Thème",
            mainColor: "Coleur Principale",
            light: "Clair",
            dark: "Sombre"
        },
        login: {
            login: "Page de Login",
            title: "Titre",
            text: "Texte"
        },
        app: {
            app: "Page de l'application",
            messages: "Messages",
            iconSrc: "Cette application utilise des icones \"material design\" pré-définies. Vous pouvez trouver la liste complète sur ",
            title: "Titre",
            icon: "Icone",
            text: "Texte"
        }
    },
    authentication: {
        authentication: "Authentification",
        method: "Méthode d'authentification",
        azureAd: {
            azureAd: "Azure AD",
            params: "configuration Azure AD",
            clientID: "Application ID",
            clientSecret: "Application Key",
            tenant: "Tenant",
            resource: "Resource",
            signinURL: "Signin URL:",
            callbackURL: "Callback URL:",
            logoutURL: "logoutURL:",
        },
        adfs: {
            adfs: "Service de Fédération AD",
            params: "configuration ADFS"
        },
        modal: {
            save_title: "Sauvegarder les modifications?",
            disable_message: "Attention, en désactivant cette méthode, l'ensemble des paramètres correspondants seront supprimés.",
            button: {
                cancel: "Annuler",
                yes: "Confirmer"
            },
            confirm: {
                title: "Demande de confirmation",
                message_delete: "Êtes vous sûr de vouloir supprimer votre clé?"
            },
            notFound: {
                title: "Aucune clé trouvée",
                message_notFound: "Aucune clé trouvée pour l'utilisateur {{user}}.",
            },

            warning: {
                title: "Quelque chose s'est mal passé...",
                instruction: "Veuillez contacter votre administrateur en communiquant les information ci-desssous:",
                status: "Status HTTP",
                message: "Message",
                code: "Code"
            },
            button: {
                close: 'Fermer',
                back: 'Retour',
                cancel: "Annuler",
                yes: "Oui"
            },
        }
    },

    modal: {
        confirm: {
            title: "Demande de confirmation",
            message_delete: "Êtes vous sûr de vouloir supprimer votre clé?"
        },
        notFound: {
            title: "Aucune clé trouvée",
            message_notFound: "Aucune clé trouvée pour l'utilisateur {{user}}.",
        },
        error: {
            title: "Erreur!",
            logoFileTooLarge: "Le ficher \"{{name}}\" (Taille: {{size}}{{unit}}) est trop gros. Veuillez sélectionner un fichier de moins de 1Mo."
        },
        done: {
            title: "Terminé!",
            message_created: "Une nouvelle clé a été générée. Elle a été envoyée à {{email}}.",
            message_oldKey: "Votre clé a été supprimée. Tous vos équipements vont être déconnectés du réseau et devrons être reconfigurés.",
            message_yourKey: "Votre clé personnelle: ",
            message_wifiNetwork: "Réseau Wi-Fi: ",
            message_delivered: "Votre clé a été envoyé à {{email}}",
            message_deleted: "Votre clé a été supprimée. Tous vos équipements vont être déconnectés du réseau."
        },
        warning: {
            title: "Quelque chose s'est mal passé...",
            instruction: "Veuillez contacter votre administrateur en communiquant les information ci-desssous:",
            status: "Status HTTP",
            message: "Message",
            code: "Code"
        },
        button: {
            close: 'Fermer',
            back: 'Retour',            
            cancel: "Annuler",
            yes: "Oui"
        },
    }
}