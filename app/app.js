
var app = angular.module('app', ["md.data.table", "ngMaterial", "ngMessages", "ngFileUpload", "ui.router", "ngValidateModule", "LocalStorageModule", "autocomplete"]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('cyan')
    .accentPalette('amber');
    
    
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/portal");


    $urlRouterProvider.when('/portal','/portal/home');
  //
  // Now set up the states
  $stateProvider

    .state('portal', {
      url: "/portal",
      templateUrl: "app/partials/portal/portal.html",
      controller: "MainController",
      authenticate:true      
    })
    .state('portal.home', {
      url: "/home",
      templateUrl: "app/partials/portal/home.html",
      controller: "HomeController",
      authenticate:true      
    })  
    .state('portal.stock', {
      url: "/stock",
      templateUrl: "app/partials/portal/stock.html",
      controller: "StockController",
      authenticate:true      
    }) 
    .state('portal.products', {
      url: "/products",
      templateUrl: "app/partials/portal/products.html",
      controller: "ProductsController",
      authenticate:true      
    })     
    .state('portal.orders', {
      url: "/orders",
      templateUrl: "app/partials/portal/orders.html",
      controller: "OrdersController",
      authenticate:true      
    }) 
    .state('portal.reports', {
      url: "/reports",
      templateUrl: "app/partials/portal/reports.html",
      controller: "ReportsController",
      authenticate:true      
    })    
    .state('portal.account', {
      url: "/account",
      templateUrl: "app/partials/portal/account.html",
      controller: "AccountController",
      authenticate:true      
    })
    .state('portal.specials', {
      url: "/register",
      templateUrl: "app/partials/portal/specials.html",
      controller: "SpecialsController",
      authenticate:true

    })    
    .state('login', {
      url: "/login",
      templateUrl: "app/partials/auth/login.html",
      controller: "LoginController"

    })
    .state('portal.register', {
      url: "/register",
      templateUrl: "app/partials/portal/register.html",
      controller: "RegisterController",
      authenticate:true

    })
    
    .state('forgotpassword', {
      url: "/forgot-password",
      templateUrl: "app/partials/auth/forgot-password.html",
      controller: "ForgotPasswordController"

    });    
    
    //$httpProvider.interceptors.push('AuthInterceptorService');
    $locationProvider.html5Mode({
        //enabled: true
    });
    

});

app.constant('WEB_API_URL', 'http://test.triotech.co.nz/flowers/');

app.run(function($rootScope, $state, localStorageService){
    
    $rootScope.$on( "$stateChangeStart", function(event, toState, toParams, fromState, fromParams){        
        $rootScope.currentUser = localStorageService.get("user");
        if(toState.name === "portal.stock" && $rootScope.currentUser.user.type === "buyer"){
            event.preventDefault();
            $state.go("portal.home");
        };
    });    
    
    $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
        $rootScope.currentState = toState.name;
        
        if (toState.authenticate && !$rootScope.currentUser){
            event.preventDefault();
            $state.go('login');
        }
        else if (!toState.authenticate && $rootScope.currentUser){
            $state.go('portal.home');
        }
        
 
    });

    
    
});


app.filter('no_false', function() {
    return function(text, length, end) {
        if (text) {
            return text;
        }
        return '';
    }
});

app.filter('false_zero', function() {
    return function(text, length, end) {
        if (text) {
            return text;
        }
        return 0;
    }
});

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
});
