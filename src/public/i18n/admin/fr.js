var fr = {
    logout: "Déconnexion",
    language: "Language",
    save: "Enregistrer",
    enabled: "Activé",
    disabled: "Désactivé",
    config: {
        config: "Configuration",
        portalAccess: "Votre Accès au Portail",
        loginUrl: "URL pour accéder à votre page de connexion (Pour configurer le portail captif):",
        userAccount: "Comptes d'entreprise",
        guestAccount: "Comptes visiteurs",
        userAccountInfo: "Autoriser les employés à se créer un Accès Réseau",
        guestAccountInfo: "Autoriser les employés à créer des Comptes Visiteurs",
        userGroup: "Groupe Utilisateurs",
        customizeDefaultPhonePrefix: "Personnaliser le préfixe télephonique par défaut",
        note: "NOTE:",
        corp_1: "Si cette option est activée, les employés pour se créer une clé personnelle (par exemple, pour un équipement BYOD)",
        corp_2: "Un employé ne peut avoir qu'UNE SEULE clé à la fois. S'il demande une nouvelle clé, la clé précédente sera révoquée.",
        guest_1: "Si cette option est activée, les employés pour créer des clés pour leurs VISITEURS.",
        guest_2: "Un employé peut générer plusieurs clés visisteur.",
        guest_3: "Il est de votre responsabilité de configurer le \"User Group\" pour que les comptes aient une durée de vie limitée."
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
            app: "Cadre de l'application pour les Clés d'Entreprise",
            app_guest: "Cadre de l'application pour les Clés Visiteur",
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