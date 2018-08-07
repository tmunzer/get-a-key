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
        customizeDefaultPhonePrefix: "Personnaliser le préfixe télephonique par défaut"
    },
    custom: {
        custom: "Personnalisation",
        logo: {
            logo: "Logos",
            header: "Logo d'entête",
            login: "Logo de la page de Login"
        },
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
            external: "Autoriser les utilisateurs externe à obtenir une clé",
            unlicensed: "Autoriser les utilisateurs sans licence",
            groupsFilter: "N'autoriser que les utilisateurs appartenant aux groupes utilisateurs suivants"
        },        
        adfs: {
            adfs: "Service de Fédération AD",
            params: "configuration ADFS",
            getAdfsMetadata: "Télecharger les Metadonnées ADFS",
            pasteAdfsMetadata: "Coller les Metadonnées ADFS",
            getAppCertificate: "Télecharger le certificat Get-a-Key",
            server: "FQDN du serveur ADFS"
        },
    },
    modal: {
        save: {
            title: "Sauvegarde effectuée",
            configuration: "Nouvelle configuration sauvegardée.",
            authentication: "Nouveaux paramètres d'authentification sauvegardés.",
            customization: "Personnalisation sauvegardée."
        },
        error: {
            title: "Erreur!",
            logoFileTooLarge: "Le ficher \"{{name}}\" (Taille: {{size}}{{unit}}) est trop gros. Veuillez sélectionner un fichier de moins de 1Mo."
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