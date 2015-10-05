app.service('MainService', function ($http, $q, localStorageService, WEB_API_URL) {

});

app.service('OdooService', function ($http, $q, WEB_API_URL, localStorageService) {
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
    this.logout = function(username, password){
        var deferred = $q.defer();
        localStorageService.remove('user');
        deferred.resolve();
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
        $http.post(WEB_API_URL + '?records=true' +        
        '&model=' + type + 
        '&offset=' + offset +
        '&limit=' + limit + 
        '&order=' + order + 
        '&sessionid=' + user.result.session_id).  
        then(function(response) {
            console.log(response);
            if (response.data.result === true){
                //deferred.resolve({"count":testData.count,"data":testData.data.slice(page*limit - limit,page*limit)});
                deferred.resolve(response.data.data);
            }
            else{deferred.reject(response);}
            }, function(response) {
                deferred.reject(response);
            });
        return deferred.promise;             
    };  
    
    
    this.searchData = function(type, page, field, search, limit, order){
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;             
    };   
    this.getData = function(type, id){
        var deferred = $q.defer();
        deferred.resolve(testData[0]);
        return deferred.promise;             
    };   
    this.addData = function(type,data){
        console.log(data);
        var user = localStorageService.get('user');
        var deferred = $q.defer();
        $http.post(WEB_API_URL, {records:true,create:true, model:type, args:data, sessionid:user.result.session_id})
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
        $http.post(WEB_API_URL, {records:true,delete:true,model:type, args:ids, sessionid:user.result.session_id})
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
        $http.post(WEB_API_URL, {records:true,update:true, model:type, args:{ids:ids,data:data}, kwargs:kwargs, sessionid:user.result.session_id})
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
        $http.post(WEB_API_URL, {records:true,state:state, model:type, args:{id:id}, sessionid:user.result.session_id})
        .then(function(response) {
            console.log(response);
            deferred.resolve(response);
            }, function(response) {
                console.log(response);
                deferred.reject(response);
            });
        
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

        $http.post(WEB_API_URL, {report:true,model:type,search:search,sessionid:user.result.session_id}).  
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
