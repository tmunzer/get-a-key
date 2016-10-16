var login = angular.module('login', [
    'ngMaterial', 'ngSanitize', 'pascalprecht.translate'
]);

login
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.definePalette('ahBlue', {
            '50': 'eaf1f4',
            '100': 'daf4ff',
            '200': 'bedaf6',
            '300': '0093d1',
            '400': '0093d1',
            '500': '0093d1',
            '600': '0093d1',
            '700': '0093d1',
            '800': '0093d1',
            '900': '0093d1',
            'A100': '0093d1',
            'A200': '0093d1',
            'A400': '0093d1',
            'A700': '0093d1',
            'contrastDefaultColor': 'light'
        })
            .theme('default')
            .primaryPalette("ahBlue", {
                'default': '600'
            })
            .accentPalette('ahBlue', {
                'default': '200' // by default use shade 400 from the pink palette for primary intentions
            });
    }).config(function ($translateProvider) {
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider
            .translations('en', en)
            .translations('fr', fr)
            .registerAvailableLanguageKeys(['en', 'fr'], {
                'en_*': 'en',
                'fr_*': 'fr'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .useSanitizeValueStrategy('sanitize');

    });

login.controller('LoginCtrl', function ($scope, $translate) {
    $scope.translate = function (langKey) {
        $translate.use(langKey);
    }
    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

});

