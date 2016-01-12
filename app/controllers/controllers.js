app.controller('MainController', function ($scope, $timeout, $rootScope, $state,$mdUtil, $mdSidenav, OdooService, $mdToast) {
    var init = function init() {  
        $scope.alerts = [];
        $scope.productsMap = {};
    };	
    
    $scope.userData = $rootScope.currentUser;
    $scope.user = $scope.userData.user;
    $scope.partner = $scope.userData.partner;    
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
        
    
    
    //setTimeout(function(){$scope.getAlerts();},5000);
    
    
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
        OdooService.loginPortal($scope.user.username,$scope.user.password).then(function(){
            $scope.loading = "";
            $state.go("portal");
        },function(data){
            $scope.loading = "";
            $scope.error =  "Incorrect username or password.";
            $mdToast.show($mdToast.simple().content('Failed to login').position("top right").hideDelay(3000));
                        
        });
    };
    
    init(); 
    });
    
    
app.controller('RegisterController', function ($scope, $rootScope,$state,$mdToast,OdooService) {
    var init = function init() {     
        $scope.user = {
            username:"",
            password:"",
            confirmpassword:"",
            email:"",
            company:"",
            type:"buyer",
            defaultProduct:""
        }
        $scope.error = "";
    };
    $scope.products = [];
    $scope.productsMap = {};
   
        $scope.products = [];
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response){
            for (var index in response.data){
                var product = response.data[index];
                $scope.products.push(product.name);
                $scope.productsMap[product.name] = product.id +4;
            }  
        });    
    
    
    $scope.register = function(){
        $scope.error = "";
        $scope.loading = "indeterminate";
        OdooService.register($scope.user.username,$scope.user.password, $scope.user.passwordconfirm, $scope.user.type, $scope.user.email, $scope.productsMap[$scope.user.defaultProduct]).then(function(){
            $scope.loading = "";
            $mdToast.show($mdToast.simple().content('Registration successful!').position("top right").hideDelay(3000));
            $state.go("portal");
        },function(data){
            $scope.loading = "";
            $scope.error =  "Invalid";
            $mdToast.show($mdToast.simple().content('Failed to register').position("top right").hideDelay(3000));
                        
        });        
    }
    
    init(); 

    
    
    });
    
app.controller('ForgotPasswordController', function ($scope, $state,$mdToast, $rootScope, OdooService) {
    var init = function init() {   
        $scope.user = {email:""};
        $scope.error = "";
    };	
    
    $scope.reset = function(){
        $scope.error = "";
        $scope.loading = "indeterminate";
        OdooService.resetPassword($scope.user.email).then(function(){
            $scope.loading = "";
            $mdToast.show($mdToast.simple().content('A new password has been sent to your address!').position("top right").hideDelay(3000));
            $state.go("login");
        },function(data){
            $scope.loading = "";
            $scope.error =  "Invalid";
            $mdToast.show($mdToast.simple().content('Failed to reset password').position("top right").hideDelay(3000));
                        
        });        
    }    
    
    init(); 

    
    
    });  
    
app.controller('HomeController', function($scope,$rootScope, OdooService){
    var init = function init(){
        $scope.user = {};
        $scope.latest = [];
        $scope.products = [];
        $scope.productsMap = {};
        $scope.itemType = "Orders";
        $scope.specials = [];
    }
 
    $scope.userData = $rootScope.currentUser;
    $scope.user = $scope.userData.user;
    $scope.partner = $scope.userData.partner;

   
    console.log($scope.userData);
    

    
    OdooService.getAllData('product.template', 1, 5, '-id').then(function(response){
        console.log(response);
        $scope.products = response.data;  
        for (var index in response.data){
            var product = response.data[index];
            $scope.productsMap[product.id +4] = product;
        }         
        OdooService.getSpecials().then(function(response){
            $scope.specials = response.data;
            for (var index in $scope.specials){
                console.log(index);
                if (index == 2){$scope.specials[index]["rows"] = 3;$scope.specials[index]["smcols"] = 1;}
                else if (index == 3){$scope.specials[index]["rows"] = 2;$scope.specials[index]["cols"] = 2; $scope.specials[index]["smcols"] = 1;}
                else if (index == 4){$scope.specials[index]["rows"] = 3;$scope.specials[index]["smcols"] = 1;}
                $scope.specials[index]["product"] = $scope.productsMap[$scope.specials[index].productid];
            }
            console.log($scope.specials);
            console.log($scope.userData);
             if ($scope.userData.user.type === "picker" || $scope.userData.user.type === "grower"){
                 $scope.itemType = "Stock";
                 OdooService.getAllData('stock.move', 1, 10, '-create_date').then(function(response){
                     console.log(response);
                     $scope.latest = response.data;

                 });        
             }
             else{
                 $scope.itemType = "Orders";
                 OdooService.getAllData('sale.order', 1, 10, '-create_date').then(function(response){
                     console.log(response);
                     $scope.latest = response.data;

                 });          
             }            
        });        


    
    });      
    
    $scope.convertDate = function(date){
        if (!date)return "";
        return new Date(date);
    };    
    //get latest orders/stock
    //get summary of key products
    
    
    
    init();
})    
    
app.controller('AccountController', function ($scope, $rootScope, OdooService) {
    var init = function init() {   
        $scope.user = {};
        
    };	
    init(); 
    
    $scope.userData = OdooService.getUser();
    $scope.user = $scope.userData.user;
    $scope.partner = $scope.userData.partner;

    $scope.products = [];
    $scope.productsMap = {};
   console.log($scope.user);
        $scope.products = [];
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response){
            for (var index in response.data){
                var product = response.data[index];
                if (parseInt(product.id + 4) === parseInt($scope.user.productid)){
                    $scope.user.defaultProduct = product.name;
                }
                $scope.products.push(product.name);
                $scope.productsMap[product.name] = product.id +4;
            }  
        }); 

    $scope.updateUser = function(){
        $scope.user.productid = $scope.productsMap[$scope.user.defaultProduct];
        angular.extend($scope.user, {"email":$scope.partner.email});
        
        OdooService.updateUser($scope.user).then(function(data){
            console.log(data);
            if (data.data.user.type){
                $rootScope.currentUser.user.type = data.data.user.type;
            }
            $scope.$parent.showToast('User Updated!'); 
        },function(){
            $scope.$parent.showToast('Failed to update user'); 
        });
            
    }
    
    
    });     
    
app.controller('StockController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 10,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.user = $rootScope.currentUser;
        $scope.products = [];
        $scope.statusMap = {"draft":"New", "cancel":"Cancelled", "confirmed" : "Confirmed", "assigned":"Ordered", "done": "Completed"};
        $scope.currentStatus = false;
    };	
    
    
    init();    

  OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.stock = response;
        console.log(response);
        angular.element(".statusSelect").on("focus",function(){
            console.log(this.value);
        });        
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response2){
            console.log(response2);
            $scope.products = response2.data;        

        });

  });
  

  
  $scope.doChangeStatus = function(stock, oldState){
        console.log(oldState);
        if (oldState === "done" && stock.state === "cancel"){
            $scope.cancelStock(stock);
        }else{
        var map = {draft:"draft", cancel: "cancel", confirmed:"confirm", assigned:"assign", done:"done"};
        OdooService.changeState('stock.move', map[stock.state], [stock.id]).then(function(){
            $scope.$parent.showToast('Status changed!');
        });
        }      
  }
  
  
  $scope.changeStatus = function(ev, stock, oldState){
        var confirm = $mdDialog.confirm()
                .title('Are you sure you want to change this status?')
                .content('This is irreversable, so be sure you want to do this!')
                .ariaLabel('Confirm status')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');      
        $mdDialog.show(confirm).then(function() {
          $scope.doChangeStatus(stock, oldState);
        }, function() {
          stock.state = oldState;
        });
  }
  
  $scope.invalidStatus = function(){
      for (var index in $scope.selected){
          var selected = $scope.selected[index];
          
          if (selected.state === "done"){return true;}
      }
      return false;
      
    }
    
    $scope.cancelStock = function(stock){
            //create a dummy order
            var cancelStock = {"partner_id":$scope.user.user.partnerid,"partner_invoice_id":$scope.user.user.partnerid,"partner_shipping_id":$scope.user.user.partnerid,"project_id":false, "client_order_ref":false,"warehouse_id":1,"pricelist_id":1,"incoterm":false,"picking_policy":"direct","order_policy":"manual","user_id":1,"section_id":false,"origin":false,"payment_term":false,"fiscal_position":false,"message_follower_ids":false,"message_ids":false};
            cancelStock["date_order"] = new Date();
            cancelStock["note"] = "Stock " + stock.id + " destroyed by " + OdooService.getUser().user.username;
            cancelStock["order_line"] = [];
            cancelStock.order_line.push([0,false,{"delay":7,"th_weight":0,"product_packaging":false,"product_id":stock.product_id[0],"name":"STOCK " + stock.id + " DESTROYED","product_uom_qty":stock.product_uom_qty,"product_uom":1,"product_uos_qty":1,"product_uos":false,"route_id":false,"price_unit":0,"tax_id":[[6,false,[]]],"discount":0}]);
            OdooService.updateData('stock.move', [stock.id], {name:"DESTROYED: " + stock.name}, {context: {lang: "en_US", tz: "Pacific/Auckland", uid: 1, params: {action: 352}}}).then(function(data){
                console.log(data);
                OdooService.addData('sale.order',cancelStock).then(function(data){                    
                        var orderId = data.data.data.result; 
                        OdooService.changeState('sale.order', "button_confirm", [orderId]).then(function(){ //confirm it
                                OdooService.getAllData('stock.move', 1, 1, "-id").then(function(response){ //find the negative stock that just created
                                    var stockId = response.data[0].id;
                                    OdooService.changeState('stock.move', "done", [stockId]).then(function(){ //confirm the negative stock
                                        $scope.$parent.showToast('Item cancelled!'); //stock has been reduced
                                        OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.stock = response;OdooService.changeState('sale.order', "done", [orderId])}); 
                                    });
                                }); 
                            });      
                });   
            });
    }
    
    $scope.isDestroyed = function(stockItem){
        return (stockItem.name.indexOf("DESTROYED") > -1);
    }
    
    $scope.onSearch = function(){
        $scope.query.page = 1;
        var search = ["|","|",["origin","ilike",$scope.query.search],["name","ilike",$scope.query.search],["picking_id","ilike",$scope.query.search]];
        OdooService.searchData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.stock = response;
        });
    }
    
    $scope.closeSearch = function(){
        $scope.query.page = 1;
        OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.stock = response;
            deferred.resolve(response);
        });
    }    
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|","|",["origin","ilike",$scope.query.search],["name","ilike",$scope.query.search],["picking_id","ilike",$scope.query.search]];
        OdooService.searchData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.stock = response;
            deferred.resolve(response);
        });        
    }
    else{
        OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.stock = response;
            deferred.resolve(response);
        });
    }
    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|","|",["origin","ilike",$scope.query.search],["name","ilike",$scope.query.search],["picking_id","ilike",$scope.query.search]];
        OdooService.searchData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.stock = response;
            deferred.resolve(response);
        });        
    }
    else{    
        OdooService.getAllData('stock.move', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.stock = response;
            $scope.query.order = order;
            deferred.resolve(response);
        });
    }
    
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
            var stockProductId = stock.product_id[0] - 4
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
        if (object.location_dest_id && object.location_dest_id[1] === 'Partner Locations/Customers'){object.product_uom_qty = -object.product_uom_qty;}
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
            x_notes:object.x_notes,
            x_held_by:object.x_held_by

        }
    };

}



app.controller('ProductsController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 10,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.products = [];
    };	
    init();    
    
  $scope.userData = $rootScope.currentUser;
  $scope.user = $scope.userData.user;
  OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.products = response;
        

  });

    $scope.onSearch = function(){
        $scope.query.page = 1;
        var search = ["|", ["default_code", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.products = response;
        });
    }    
    
    $scope.closeSearch = function(){
        $scope.query.page = 1;
        OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
              $scope.products = response;
        });
    }     
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|", ["default_code", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.products = response;
            deferred.resolve(response);
        });        
    }
    else{
        OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.products = response;
            deferred.resolve(response);
        });
    }    

    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|", ["default_code", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.products = response;
            $scope.query.order = order;
            deferred.resolve(response);
        });        
    }
    else{
        OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.products = response;
            $scope.query.order = order;
            deferred.resolve(response);
        });
    }       
    
    return deferred.promise;
  };  
  
  $scope.addItem = function(event){
    $mdDialog.show({
          controller: ProductDialogController,
          templateUrl: 'app/partials/dialog/add-product.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose:true,
          locals:{selected:$scope.selected}
        }).then(function(newProduct){
            OdooService.addData('product.template',newProduct.create).then(function(){
                $scope.$parent.showToast('New item added!');               
                OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.products = response;})
            },function(){
                $scope.$parent.showToast('Failed to add item');       
            });
        });
  };

    $scope.editItem = function(event){
      $mdDialog.show({
            controller: ProductDialogController,
            templateUrl: 'app/partials/dialog/edit-product.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected}
          }).then(function(stock){
            OdooService.updateData('product.template',stock.update.ids, stock.update.data, {context: {lang: "en_US", tz: "Pacific/Auckland", uid: 1, params: {action: 352}}}).then(function(){
                $scope.$parent.showToast('Items updated!');              
                OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.products = response;})
            },function(){
                $scope.$parent.showToast('Failed to update items');
            });
        });
    }; 
    
    $scope.removeItem = function(event){
      $mdDialog.show({
            controller: ProductDialogController,
            templateUrl: 'app/partials/dialog/remove-product.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected, products:$scope.products}
          }).then(function(removeProduct){
                OdooService.removeData('product.template',removeProduct.remove).then(function(){
                    $scope.$parent.showToast('Items removed!');        
                OdooService.getAllData('product.template', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.products = response;});
                },function(){
                    $scope.$parent.showToast('Failed to remove items');
                });
            });
    };   
  
  
  
  
  
  
  
});

function ProductDialogController($scope, $mdDialog, $timeout, Upload, WEB_API_URL, selected, OdooService) {
    $scope.newProduct = {};
    $scope.product = selected.length > 0 ? angular.copy(selected[0]) : {};
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.create = function() {
      $mdDialog.hide({create:$scope.convertForOdoo($scope.newProduct)});
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
        $mdDialog.hide({update:{ids:ids,data:$scope.convertForOdoo($scope.product)}});
    };    
    $scope.uploadFiles = function(file) {
        if (file && !file.$error) {
            $scope.uploading = "indeterminate";
            var reader = new FileReader();
            reader.onload = function(frEvent) {
                var dataURL = frEvent.target.result;
                var data = dataURL.split(",").pop();
                $scope.newProduct.image_medium = data;
                $scope.product.image_medium = data;
                $scope.uploading = "";
            }
            reader.readAsDataURL(file);            

        }   
    } //cr, uid, id, field, value, arg
    $scope.convertForOdoo = function(object){
        return {
            name:object.name,
            image_medium:object.image_medium,
            list_price: object.list_price,
            uom_id:1,
            purchase_ok: true,
            sale_ok: true,
            location_id:2,
            location_dest_id:12,
            product_uom:1,
            type:"product"

        }
    };

}







app.controller('OrdersController', function($scope, $rootScope, $q, $timeout, $mdDialog, OdooService, $mdToast, $mdBottomSheet){
    var init = function init() {     
        $scope.selected = [];
        $scope.query = {
          order: '-id',
          limit: 10,
          offset:0,
          page: 1,
          search:''
        };  
        $scope.products = [];
        $scope.productsMap = {};
        $scope.statusMap = {draft:"New", cancel: "Cancelled", progress:"Invoiced", manual:"Confirmed", sent:"Sent", done:"Completed"};
        console.log($scope.$parent);
    };	
    init();    

  OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
      console.log(response);
        $scope.orders = response;
        OdooService.getAllData('product.template', 1, 99999, 'name').then(function(response2){
            console.log(response2);
            $scope.products = response2.data;   

            for (var index in $scope.products){
                var product = $scope.products[index];
                $scope.productsMap[product.name] = product;
            }
            
            $scope.canBeMet($scope.orders.data);
            


        });

  });
  

    $scope.onSearch = function(){
        $scope.query.page = 1;
        var search = ["|", ["client_order_ref", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
        });
    }    
    
    $scope.closeSearch = function(){
        $scope.query.page = 1;
        OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){            
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
        });
    }    
  
  
  $scope.onPageChange = function(page, limit) {
    $scope.query.page = page;
    $scope.query.limit = limit;
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|", ["client_order_ref", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
            deferred.resolve(response);
        });        
    }
    else{
        OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
            deferred.resolve(response);
        });
    }        
    
    return deferred.promise;
  };
  
  $scope.onOrderChange = function(order) {
    var deferred = $q.defer();
    if ($scope.query.search.length > 0){
        var search = ["|", ["client_order_ref", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
        OdooService.searchData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
            $scope.query.order = order;
            deferred.resolve(response);
        });        
    }
    else{
        OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
            $scope.orders = response;
            $scope.canBeMet($scope.orders.data);
            $scope.query.order = order;
            deferred.resolve(response);
        });
    }     
    
    return deferred.promise;
  };  
  
    $scope.canBeMet = function(orders){
        var lineItems = [],orderLineMap = {};

        for (var index in orders){ //collect line items
            orders[index].canBeMet = true;
            if (orders[index].state !== "done"){ //dont bother if order is already done
                for (var index2 in orders[index].order_line){
                    lineItems.push(orders[index].order_line[index2]);
                    orderLineMap[orders[index].order_line[index2]] = orders[index];
                }
            }
            else{orders[index].canBeMet = false;}
        }

        //do one great call to odoo. this stops odoo expiring the session if too many requests are sent
        OdooService.getData("sale.order.line", lineItems,["sequence","delay","state","th_weight","product_packaging","product_id","name","product_uom_qty","product_uom","product_uos_qty","product_uos","route_id","price_unit","tax_id","discount","price_subtotal"]).then(function(data){

            for (var index in data){
                var line = data[index], order = orderLineMap[line.id], product = $scope.productsMap[line.product_id[1]];
                if (product.qty_available >= line.product_uom_qty){
                    order.canBeMet = order.canBeMet && true;
                }
                else{order.canBeMet = false;}   
            }
  
        });        
    };
       
      
  
  
  
  $scope.getStatusTypes = function () {
    return ['draft', 'cancel', 'sent', 'progress', 'manual', 'done'];
  };
  
  $scope.doChangeStatus = function(order){
        var map = {draft:"draft", cancel: "cancel", progress:"progress", manual:"button_confirm", sent:"sent", done:"done"};
        console.log(map[order.state]);
        if (order.state === "progress"){
            OdooService.createInvoice(order).then(function(){
                $scope.$parent.showToast('Invoice sent!');
            });
        }
        else{
            OdooService.changeState('sale.order', map[order.state], [order.id]).then(function(){
                if (map[order.state] === "button_confirm"){
                    OdooService.getAllData('stock.move',1,5,'-id').then(function(data){ //confirm stock change
                         console.log(data);
                         var stock = data.data.filter(function(data){
                             return data.location_dest_id[1] === 'Partner Locations/Customers';
                         });
                         if (stock.length > 0){

                             var stockItem = stock[0];
                             console.log(stockItem);
                             OdooService.changeState('stock.move', "done", [stockItem.id]).then(function(data){
                                 console.log(data);
                             });
                         } 
                     })
                }                
            });
            $scope.$parent.showToast('Status changed!');

        }
        

        
  }
  
  $scope.changeStatus = function(ev, order, oldStatus){
        var confirm = $mdDialog.confirm()
                .title('Are you sure you want to change this status?')
                .content('This is irreversable, so be sure you want to do this!')
                .ariaLabel('Confirm status')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');      
        $mdDialog.show(confirm).then(function() {
          $scope.doChangeStatus(order);
        }, function() {
            if ($scope.query.search.length > 0){
                var search = ["|", ["client_order_ref", "ilike", $scope.query.search], ["name", "ilike", $scope.query.search]];
                OdooService.searchData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order, search).then(function(response){
                    $scope.orders = response;
                    $scope.canBeMet($scope.orders.data);
                });        
            }
            else{
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){
                    $scope.orders = response;
                    $scope.canBeMet($scope.orders.data);
                });
            }
        });
  }  
  
  $scope.sendInvoice = function(order){
      $mdDialog.show({
            controller: OrderDialogController,
            templateUrl: 'app/partials/dialog/confirm-invoice.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true,
            locals:{selected:$scope.selected, products:$scope.products}
          }).then(function(){
                OdooService.createInvoice(order).then(function(){
                    $scope.$parent.showToast('Invoice sent!'); 
                    order.state = "progress";
                }, function(){$scope.$parent.showToast('Failed to send invoice');} );       
            }
          ,function(){
                    $scope.$parent.showToast('Failed to remove items');
                });
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
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;$scope.canBeMet($scope.orders.data);})
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
            OdooService.updateData('sale.order',order.update.ids, order.update.data, {context: {lang: "en_US", tz: "Pacific/Auckland", uid: 1, params: {action: 380}}}).then(function(){
                $scope.$parent.showToast('Items updated!');              
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;$scope.canBeMet($scope.orders.data);})
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
                OdooService.getAllData('sale.order', $scope.query.page, $scope.query.limit, $scope.query.order).then(function(response){$scope.orders = response;$scope.canBeMet($scope.orders.data);});
                },function(){
                    $scope.$parent.showToast('Failed to remove items');
                });
            });
    };

    $scope.viewProducts = function(event, order){
        console.log("here");
        $mdDialog.show({
              controller: OrderDialogController,
              templateUrl: 'app/partials/dialog/view-products.html',
              parent: angular.element(document.body),
              targetEvent: event,
              clickOutsideToClose:true,
              locals:{selected:[order], products:$scope.products}
            })      
    }    
  
});


function OrderDialogController($scope, $mdDialog, $timeout, Upload, WEB_API_URL, selected, products, OdooService) {
    $scope.user = OdooService.getUser();
    $scope.newOrder = {lineItems:[{}], date_order:new Date()};
    console.log(selected);
    $scope.order = selected.length > 0 ? angular.copy(selected[0]) : {};
    $scope.lineItems = [];
    $scope.query = {};
    if ($scope.order){
        $scope.order.date_order = new Date($scope.order.date_order);
        $scope.query.order = 'name';
        $scope.order.lineItems = [{}];
        OdooService.getData("sale.order.line", $scope.order.order_line,["sequence","delay","state","th_weight","product_packaging","product_id","name","product_uom_qty","product_uom","product_uos_qty","product_uos","route_id","price_unit","tax_id","discount","price_subtotal"]).then(function(data){
            $scope.order.lineItems = data;
            $scope.lineItems = data;
        });
    }
    
    $scope.getQuantityTotal = function(data){
        console.log(data);
        var selectedProduct;
        for (var index in products){
            var product = products[index];
            if (product.name === data){
                selectedProduct = product;
                break;
            }
        }      
        $timeout(function(){
            var lineItems = selected.length > 0 ? $scope.order.lineItems : $scope.newOrder.lineItems;
            console.log(lineItems);
            for (var index in lineItems){
                if (lineItems[index].name === data){
                    lineItems[index].quantityAvailable = selectedProduct.qty_available;
                }
            }
        },1000);
    }
    
    $scope.products = [];
    $scope.productsMap = {};
    $scope.productsPriceMap = {};
    for (var index in products){
        var product = products[index];
        $scope.products.push(product.name);
        $scope.productsMap[product.name] = product.id +4;
        $scope.productsPriceMap[product.name] = product.list_price;
    }

    $scope.addLineItem = function(lineItems){
        lineItems.push({});
    }
    
    $scope.removeLineItem = function(index, lineItems){
        if (lineItems.length < 2){return;}
        if (lineItems[index].id){
            OdooService.removeData('sale.order.line',[lineItems[index].id]).then(function(){
                lineItems.splice(index,1);
            });
        }
        else{
            lineItems.splice(index,1);
        }
    }   
    
    
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.create = function() {
      for (var index in $scope.newOrder.lineItems){if (!$scope.newOrder.lineItems[index].name || !$scope.newOrder.lineItems[index].product_uom_qty){return;}}
      console.log($scope.convertForOdoo($scope.newOrder));
      $mdDialog.hide({create:$scope.convertForOdoo($scope.newOrder)});
    };
    $scope.confirm = function() {
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}
        $mdDialog.hide({remove:ids});
    };    
    $scope.confirmInvoice = function() {
        $mdDialog.hide();
    };       
    $scope.update = function() {
        for (var index in $scope.order.lineItems){if (!$scope.order.lineItems[index].name || !$scope.order.lineItems[index].product_uom_qty){return;}}
        var ids = [];
        for (var index in selected){ids.push(selected[index].id);}      
        console.log(ids);
        $mdDialog.hide({update:{ids:ids,data:$scope.convertForOdoo($scope.order)}});
    };    
    


     //cr, uid, id, field, value, arg
    $scope.convertForOdoo = function(object){
        //important for odoo:
        var order = {"partner_id":$scope.user.user.partnerid,"partner_invoice_id":$scope.user.user.partnerid,"partner_shipping_id":$scope.user.user.partnerid,"project_id":false, "client_order_ref":false,"warehouse_id":1,"pricelist_id":1,"incoterm":false,"picking_policy":"direct","order_policy":"manual","user_id":1,"section_id":false,"origin":false,"payment_term":false,"fiscal_position":false,"message_follower_ids":false,"message_ids":false};
        order["date_order"] = object.date_order;
        order["note"] = object.note;
        order["order_line"] = [];
        for (var index in object.lineItems){
            var line = object.lineItems[index];
            if (line.id){
                order.order_line.push([1,line.id,{"product_uom_qty":line.product_uom_qty,"product_id":$scope.productsMap[line.name],"name":line.name, "price_unit":$scope.productsPriceMap[line.name]}]);               
            }
            else{
                order.order_line.push([0,false,{"delay":7,"th_weight":0,"product_packaging":false,"product_id":$scope.productsMap[line.name],"name":line.name,"product_uom_qty":line.product_uom_qty,"product_uom":1,"product_uos_qty":1,"product_uos":false,"route_id":false,"price_unit":$scope.productsPriceMap[line.name],"tax_id":[[6,false,[]]],"discount":0}]);
            }
        }         
        return order;
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