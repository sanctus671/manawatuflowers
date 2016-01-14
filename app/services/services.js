app.service('MainService', function ($http, $q, localStorageService, WEB_API_URL) {
   
    


});





app.service('OdooService', function ($http, $q, $state, WEB_API_URL, localStorageService) {
    this.login = function(username, password){
        var deferred = $q.defer();
        $http.post(WEB_API_URL + '?login=true' + 
        '&username=' + username +
        '&password=' + password).  
        then(function(response) {
            if (response.data.result === true && response.data.data.result.uid){
                localStorageService.set('user',response.data.data);
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    }

    this.loginPortal = function(username, password){
        var deferred = $q.defer();
        $http.post(WEB_API_URL + '?loginportal=true' + 
        '&username=' + username +
        '&password=' + password).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                localStorageService.set('user',response.data.data);
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    }    
    
    
    this.register = function(username, password, passwordconfirm, type, email, productid){
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {register:true, username:username, password:password, passwordconfirm:passwordconfirm, type:type, email:email, productid:productid}).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                localStorageService.set('user',response.data.data);
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    }    
    
    this.logout = function(username, password){
        var deferred = $q.defer();
        localStorageService.remove('user');
        deferred.resolve();
        return deferred.promise;             
    }   
    
    this.resetPassword = function(email){
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {resetpassword:true, email:email}).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                localStorageService.set('user',response.data.data);
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;         
    }
    
    this.updateUser = function(user){
        var deferred = $q.defer();
        console.log(user);
        $http.post(WEB_API_URL, {updateuser:true, userid: user.local_userid, partnerid: user.partnerid, currentpassword: user.currentPassword, password:user.password, passwordconfirm:user.passwordconfirm, type:user.type, email:user.email, productid:user.productid, sessionid:user.session_id}).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                var userUpdated = localStorageService.get('user');
                userUpdated.user.type = user.type;
                userUpdated.partner.email = user.email;
                userUpdated.user.productid = user.productid;
                localStorageService.set('user',userUpdated);
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;          
    }
    
    this.getUser = function(){
        return localStorageService.get('user');
    }
    
    this.getSpecials = function(){
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL + "?specials=true&sessionid=" + user.user.session_id).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;           
    }
    
    this.updateSpecial = function(id, productid, colour){
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {updatespecial:true, id: id, productid: productid, colour: colour, sessionid:user.user.session_id}).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                deferred.resolve(response.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;          
    }
    
    this.getAllData = function(type, page, limit, order){
        var offset = page*limit - limit;
        var deferred = $q.defer();
        var user = localStorageService.get('user');
        var OdooService = this;
        console.log(order);
        var orderArray = order.split("-");
        order = orderArray.length > 1 ? order = orderArray[1] + " DESC" : order = orderArray[0] + " ASC";
        console.log(order);
        var query = '?records=true' +        
        '&model=' + type + 
        '&offset=' + offset +
        '&limit=' + limit + 
        '&order=' + order + 
        '&sessionid=' + user.user.session_id;

        if (type === "stock.move" && (user.user.type === "picker" || user.user.type === "grower")){
                query = query +  '&partnerid=' + user.user.partnerid;
        }
        else if (type === "sale.order" && (user.user.type === "buyer")){
                query = query +  '&partnerid=' + user.user.partnerid;
        }

        $http.post(WEB_API_URL + query).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                //deferred.resolve({"count":testData.count,"data":testData.data.slice(page*limit - limit,page*limit)});
                if (response.data.data.count === null){
                    OdooService.logout();
                    $state.go("login");
                    deferred.reject(response);                    
                }
                deferred.resolve(response.data.data);
            }
            else{
                if (response.data.data.error.message === "Odoo Session Expired");
                    OdooService.logout();
                    $state.go("login");
                    deferred.reject(response);  
            }
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    };  
    
    
    this.searchData = function(type, page, limit, order, search){
        var offset = page*limit - limit;
        var deferred = $q.defer();
        var user = localStorageService.get('user');
        var OdooService = this;
        console.log(order);
        var orderArray = order.split("-");
        order = orderArray.length > 1 ? order = orderArray[1] + " DESC" : order = orderArray[0] + " ASC";

        var data = {records:true,search:true, searchdata:search, model:type, args:search, limit: limit, offset: offset, order:order, sessionid:user.user.session_id}
        
        if (type === "stock.move" && (user.user.type === "picker" || user.user.type === "grower")){
                data['partnerid'] = user.user.partnerid;
        }
        else if (type === "sale.order" && (user.user.type === "buyer")){
                data['partnerid'] = user.user.partnerid;
        }

        $http.post(WEB_API_URL, data).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                //deferred.resolve({"count":testData.count,"data":testData.data.slice(page*limit - limit,page*limit)});
                if (response.data.data.count === null){
                    OdooService.logout();
                    $state.go("login");
                    deferred.reject(response);                    
                }
                deferred.resolve(response.data.data);
            }
            else{
                if (response.data.data.error.message === "Odoo Session Expired");
                    OdooService.logout();
                    $state.go("login");
                    deferred.reject(response);  
            }
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    };   
    
    
    this.getData = function(type, ids, fields){
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,single:[ids,fields], model:type, sessionid:user.user.session_id})
        .then(function(response) {
            console.log(response);
            if (response.data.result === true){
                deferred.resolve(response.data.data.result);
            }
            else {
                deferred.reject(response);
            }
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        
        return deferred.promise;             
    };   
    this.addData = function(type,data){
        console.log(data);
        var user = localStorageService.get('user');
        data["partner_id"] = user.user.partnerid;
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,create:true, model:type, args:data, sessionid:user.user.session_id})
        .then(function(response) {
            console.log(response);
            deferred.resolve(response);
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        
        return deferred.promise;          
    };
    this.removeData = function(type, ids){
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,delete:true,model:type, args:ids, sessionid:user.user.session_id})
        .then(function(response) {
            console.log(response);
            deferred.resolve(response);
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        return deferred.promise;          
    };
    this.updateData = function(type, ids, data, kwargs){
        console.log(data);
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,update:true, model:type, args:{ids:ids,data:data}, kwargs:kwargs, sessionid:user.user.session_id})
        .then(function(response) {
            console.log(response);
            deferred.resolve(response);
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        
        return deferred.promise;         
    };
    
    this.changeState = function(type, state, id){
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,state:state, model:type, args:{id:id}, sessionid:user.user.session_id})
        .then(function(response) {
            console.log(response);
            deferred.resolve(response);
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        
        return deferred.promise;          
    }
    
    this.createInvoice = function(order){
        //create invoice -> get id -> change status of order ->validate invoice
        console.log(order);
        var deferred = $q.defer(),
        OdooService = this,
        user = localStorageService.get('user'),
        lineItems = [],
        orderId = order.id;
        OdooService.getData("sale.order.line", order.order_line,["sequence","delay","state","th_weight","product_packaging","product_id","name","product_uom_qty","product_uom","product_uos_qty","product_uos","route_id","price_unit","tax_id","discount","price_subtotal"]).then(function(data){
            console.log(data);
            lineItems = data;
            var invoiceLineItems = [];
            for (var index in lineItems){
                var line = lineItems[index];
                invoiceLineItems.push({"advance_payment_method":"all","qtty":line.product_uom_qty,"product_id":line.product_id[0],"amount":line.price_subtotal});            
            }
            var invoiceLineItems = [{"advance_payment_method":"all","qtty":1,"product_id":56,"amount":150}];
            console.log(invoiceLineItems);
            $http.post(WEB_API_URL, {createinvoice:true,model:"sale.advance.payment.inv", args:invoiceLineItems, kwargs:{context:{params:{action:380},active_id:orderId, active_ids:[orderId]}}, sessionid:user.user.session_id}).then(function(data){
                console.log(data)
                if (data.data.data.error){deferred.reject(data);}
                var invoiceId = data.data.data.result;
                $http.post(WEB_API_URL, {assigninvoice:true,model:"sale.advance.payment.inv", args:[[invoiceId],{"params":{"action":380},"active_model":"sale.order","active_id":orderId,"active_ids":[orderId]}],  sessionid:user.user.session_id}).then(function(data){
                    if (data.data.data.error){deferred.reject(data);}
                    console.log(data);
                    $http.post(WEB_API_URL, {sendinvoice:true,id:invoiceId, order:order,kwargs:{context:{params:{action:380},active_id:orderId, active_ids:[orderId]}},  sessionid:user.user.session_id}).then(function(data){
                        console.log(data);
                        deferred.resolve(data);
                    });
                    
                },function(data){deferred.reject(data);});
                
                
                
            },function(data){deferred.reject(data);})
            
            
            
        },function(data){deferred.reject(data);});        

        return deferred.promise;                 
    }
    
    function checkData(data){
        if (data.data.result){
            return true;
        }
        return false;
    }
    
    this.getReport = function(type, search){
        var deferred = $q.defer();
        var user = localStorageService.get('user');
        var OdooService = this;

        $http.post(WEB_API_URL, {report:true,model:type,search:search,sessionid:user.user.session_id}).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                  
                deferred.resolve(response.data.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    };      
    
    
});
