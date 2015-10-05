app.controller('MainController', function ($scope, $timeout, $rootScope, $state,$mdUtil, $mdSidenav, OdooService, $mdToast) {
    var init = function init() {     
    };	
    $scope.toggleNav = $mdUtil.debounce(function(){$mdSidenav("left").toggle()},200);
    $scope.logout = function(){
        OdooService.logout().then(function(){
           $state.go("login"); 
        });
    }
    $scope.showToast = function(message){
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .position("top right")
            .hideDelay(3000)
        );        
    }

    
    
    init(); 

    
    
    });
    
    
app.controller('LoginController', function ($scope, $state, $rootScope, $mdToast,OdooService) {
    var init = function init() {     
        $scope.user = {
            username:"",
            password:"",
            remember:false
        };
        $scope.error = "";
    };	
    

    $scope.login = function(){
        $scope.error = "";
        $scope.loading = "indeterminate";
        OdooService.login($scope.user.username,$scope.user.password).then(function(){
            $scope.loading = "";
            $state.go("portal");
        },function(data){
            $scope.loading = "";
            $scope.error =  "Incorrect username or password.";
            $mdToast.show($mdToast.simple().content('Failed to login!').position("top right").hideDelay(3000));
                        
        });
    };
    
    init(); 
    });
    
    
app.controller('RegisterController', function ($scope, $rootScope) {
    var init = function init() {     
    };	
    init(); 

    
    
    });
    
app.controller('ForgotPasswordController', function ($scope, $rootScope) {
    var init = function init() {     
    };	
    init(); 

    
    
    });  
    
app.controller('StockController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 5,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.products = [];
        console.log($scope.$parent);
    };	
    init();    

  OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.stock = response;
        console.log(response);
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response2){
            console.log(response2);
            $scope.products = response2.data;        

        });

  });
  
  
  $scope.getStatusTypes = function () {
    return ['draft', 'cancel', 'confirmed', 'assigned', 'done'];
  };
  
  $scope.changeStatus = function(stock){
        var map = {draft:"draft", cancel: "cancel", confirmed:"confirm", assigned:"assign", done:"done"};
        OdooService.changeState('stock.move', map[stock.state], [stock.id])
  }
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.stock = response;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.stock = response;
        $scope.query.order = order;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };
  
  
  $scope.addItem = function(event){
    $mdDialog.show({
          controller: StockDialogController,
          templateUrl: 'app/partials/dialog/add-stock.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose:true,
          locals:{selected:$scope.selected, products:$scope.products}
        }).then(function(newStock){
            OdooService.addData('stock.move',newStock.create).then(function(){
                $scope.$parent.showToast('New item added!');               
                OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.stock = response;})
            },function(){
                $scope.$parent.showToast('Failed to add item');       
            });
        });
  };

    $scope.editItem = function(event){
      $mdDialog.show({
            controller: StockDialogController,
            templateUrl: 'app/partials/dialog/edit-stock.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected,products:$scope.products}
          }).then(function(stock){
            OdooService.updateData('stock.move',stock.update.ids, stock.update.data, {context: {lang: "en_US", tz: "Pacific/Auckland", uid: 1, params: {action: 173}}}).then(function(){
                $scope.$parent.showToast('Items updated!');              
                OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.stock = response;})
            },function(){
                $scope.$parent.showToast('Failed to update items');
            });
        });
    }; 
    
    $scope.removeItem = function(event){
        for (var index in $scope.selected){
            var selectedItem = $scope.selected[index];
            if (selectedItem.state !== "draft"){
                $scope.$parent.showToast('Can only remove items in with status draft'); 
                return;
            }
        }
      $mdDialog.show({
            controller: StockDialogController,
            templateUrl: 'app/partials/dialog/remove-stock.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected, products:$scope.products}
          }).then(function(removeStock){
                OdooService.removeData('stock.move',removeStock.remove).then(function(){
                    $scope.$parent.showToast('Items removed!');        
                OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.stock = response;});
                },function(){
                    $scope.$parent.showToast('Failed to remove items');
                });
            });
    }; 
    
    $scope.convertDate = function(date){
        if (!date)return "";
        return new Date(date);
    };
    $scope.getProduct = function(stock){
        if ($scope.stock.length < 1){return;}
        if (stock.product_id){
            var stockProductId = stock.product_id[0] -4;
            for (var index in $scope.products){
                var product = $scope.products[index];
                if (product.id === stockProductId){stock.breed = product.name; return stock.breed;}
            }      
        }       
    };    
  

});


function StockDialogController($scope, $mdDialog, $timeout, Upload, WEB_API_URL, selected, products, OdooService) {
    $scope.newStock = {};
    $scope.stock = selected.length > 0 ? angular.copy(selected[0]) : {};
    if ($scope.stock){
        $scope.stock.date_expected = new Date($scope.stock.date_expected);
    }
    $scope.products = [];
    $scope.productsMap = {};
    for (var index in products){
        var product = products[index];
        $scope.products.push(product.name);
        $scope.productsMap[product.name] = product.id +4;
    }
   
    
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.create = function() {
      $mdDialog.hide({create:$scope.convertForOdoo($scope.newStock)});
    };
    $scope.confirm = function() {
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}
        $mdDialog.hide({remove:ids});
    };    
    $scope.update = function() {
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}      
        console.log(ids);
        $mdDialog.hide({update:{ids:ids,data:$scope.convertForOdoo($scope.stock)}});
    };    
    $scope.uploadFiles = function(file) {
        if (file && !file.$error) {
            $scope.uploading = "indeterminate";
            file.upload = Upload.upload({
                url: WEB_API_URL,
                data: {file: file,upload:true}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    $scope.uploading = "";
                    console.log(response);
                    if (response.data.result === true){
                        file.result = response.data;
                        $scope.stock.x_img_url = WEB_API_URL + response.data.data.url;
                        $scope.newStock.x_img_url = WEB_API_URL + response.data.data.url;
                    }
                    else{
                        $scope.errorMsg = response.data;
                    }
                });
            }, function (response) {
                $scope.uploading = "";
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            });
        }   
    } //cr, uid, id, field, value, arg
    $scope.convertForOdoo = function(object){
        return {
            name:object.name,
            product_id:$scope.productsMap[object.breed],
            product_tmpl_id:$scope.productsMap[object.breed] - 4,
            product_uom_qty:object.product_uom_qty,
            date_expected:object.date_expected,
            location_id:2,
            location_dest_id:12,
            product_uom:1,
            x_quality:object.x_quality,
            x_img_url:object.x_img_url,
            x_notes:object.x_notes

        }
    };

}



app.controller('ProductsController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 5,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.products = [];
        console.log($scope.$parent);
    };	
    init();    

  OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.products = response;
        

  });
  
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.products = response;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.products = response;
        $scope.query.order = order;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };  
  
});



app.controller('OrdersController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 5,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.products = [];
        console.log($scope.$parent);
    };	
    init();    

  OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.orders = response;
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response2){
            console.log(response2);
            $scope.products = response2.data;        

        });

  });
  
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.orders  = response;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
        $scope.orders = response;
        $scope.query.order = order;
        deferred.resolve(response);
    });
    
    return deferred.promise;
  };  
  
  $scope.getStatusTypes = function () {
    return ['draft', 'cancel', 'sent', 'progress', 'done'];
  };
  
  $scope.changeStatus = function(stock){
        var map = {draft:"draft", cancel: "cancel", progress:"progress", sent:"sent", done:"done"};
        OdooService.changeState('sale.order', map[stock.state], [stock.id])
  }  
  
    $scope.getProduct = function(order){
        if ($scope.orders.length < 1){return;}
        if (order.product_id){
            var orderProductId = order.product_id[0] -4;
            for (var index in $scope.products){
                var product = $scope.products[index];
                if (product.id === orderProductId){order.breed = product.name; return order.breed;}
            }      
        }       
    };  
    
    $scope.convertDate = function(date){
        if (!date)return "";
        return new Date(date);
    };  
    
  $scope.addItem = function(event){
    $mdDialog.show({
          controller: OrderDialogController,
          templateUrl: 'app/partials/dialog/add-order.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose:true,
          locals:{selected:$scope.selected, products:$scope.products}
        }).then(function(newOrder){
            OdooService.addData('sale.order',newOrder.create).then(function(){
                $scope.$parent.showToast('New item added!');               
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;})
            },function(){
                $scope.$parent.showToast('Failed to add item');       
            });
        });
  };

    $scope.editItem = function(event){
      $mdDialog.show({
            controller: OrderDialogController,
            templateUrl: 'app/partials/dialog/edit-order.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected,products:$scope.products}
          }).then(function(order){
            OdooService.updateData('sale.order',order.update.ids, order.update.data).then(function(){
                $scope.$parent.showToast('Items updated!');              
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;})
            },function(){
                $scope.$parent.showToast('Failed to update items');
            });
        });
    }; 
    
    $scope.removeItem = function(event){
        for (var index in $scope.selected){
            var selectedItem = $scope.selected[index];
            if (selectedItem.state !== "draft"){
                $scope.$parent.showToast('Can only remove items in with status draft'); 
                return;
            }
        }
      $mdDialog.show({
            controller: OrderDialogController,
            templateUrl: 'app/partials/dialog/remove-order.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected, products:$scope.products}
          }).then(function(removeOrder){
                OdooService.removeData('sale.order',removeOrder.remove).then(function(){
                    $scope.$parent.showToast('Items removed!');        
                OdooService.getAllData('sale.orders', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;});
                },function(){
                    $scope.$parent.showToast('Failed to remove items');
                });
            });
    };     
  
});


function OrderDialogController($scope, $mdDialog, $timeout, Upload, WEB_API_URL, selected, products, OdooService) {
    $scope.newOrder = {};
    $scope.order = selected.length > 0 ? angular.copy(selected[0]) : {};
    if ($scope.order){
        $scope.order.order_date = new Date($scope.order.order_date);
    }
    $scope.products = [];
    $scope.productsMap = {};
    for (var index in products){
        var product = products[index];
        $scope.products.push(product.name);
        $scope.productsMap[product.name] = product.id +4;
    }
   
    
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.create = function() {
      $mdDialog.hide({create:$scope.convertForOdoo($scope.newOrder)});
    };
    $scope.confirm = function() {
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}
        $mdDialog.hide({remove:ids});
    };    
    $scope.update = function() {
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}      
        console.log(ids);
        $mdDialog.hide({update:{ids:ids,data:$scope.convertForOdoo($scope.order)}});
    };    

     //cr, uid, id, field, value, arg
    $scope.convertForOdoo = function(object){
        return {
            name:object.name,
            product_id:$scope.productsMap[object.breed],
            product_tmpl_id:$scope.productsMap[object.breed] - 4,
            product_uom_qty:object.product_uom_qty,
            date_expected:object.date_expected,
            location_id:2,
            location_dest_id:12,
            product_uom:1,
            x_quality:object.x_quality,
            x_img_url:object.x_img_url,
            x_notes:object.x_notes

        }
    };

}


app.controller('ReportsController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    $scope.generateReport = function(){
        console.log("here");
        OdooService.getReport("account.invoice", [["type", "=", "out_invoice"], ["state", "=", "open"]]).then(function(data){
            console.log(data);
        });
    }
});