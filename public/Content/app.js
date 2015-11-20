var app = angular.module('myApp', ['ngRoute']).config(['$routeProvider', function($routeProvider) {

    $routeProvider

    // home page
    .when('/createClaim', {
        templateUrl: 'createClaim.html',
        controller: 'mainController'
    })

    .when('/updateClaim', {
        templateUrl: 'updateClaim.html',
        controller: 'mainController'
    })

    .when('/viewClaims', {
        templateUrl: 'viewClaims.html',
        controller: 'mainController'
    });

}]);

app.controller('mainController', function($scope, $http, $location) {

    $http.get('/claims').success(function(data) {
        $scope.claims = data;
        console.log(data);
    });

    // $scope.submit = function() {
    //   console.log($scope.startDate);
    //   console.log($scope.endDate);
    // };

    // $scope.dateRangeFilter = function (property, startDate, endDate) {
    //   return function (item) {
    //       if (item[property] === null) return false;

    //       var itemDate = moment(item[property]);
    //       var s = moment(startDate, "DD-MM-YYYY");
    //       var e = moment(endDate, "DD-MM-YYYY");

    //       if (itemDate >= s && itemDate <= e) return true;
    //       return false;
    //       }
    //   };



    $scope.delete = function (number) {
        console.log("deleting");
         $http({
            method: 'POST',
            url: '/delete',
            data: {id: number}
        }).success(function() {
            console.log("POST Json object worked!");
        }).error(function(){
            console.log("POST Json object failed!");
        });
        $location.path('/home');
    };

});

app.filter('dateRangeFilter', function() {
    return function(input, startDate, endDate) {
        
        var retArray = [];
        
        angular.forEach(input, function(obj){
            console.log("HERE IS THE INPUT");
            console.log(input);
            
            console.log("START DATE");
            console.log(startDate);

            console.log("END DATE");
            console.log(endDate);

            var receivedDate = obj.received;
            
            if(receivedDate >= startDate && receivedDate <= endDate) {
                retArray.push(obj);         
            }
        }); 
        
        return retArray; 
    };
});
