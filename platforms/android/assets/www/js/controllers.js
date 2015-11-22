angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

})

.controller('GradesCtrl', function($scope, $http, $localstorage, $state) {

  $scope.$on('$ionicView.enter', function(e) {
    $http.get('https://uniara-virtual-api.herokuapp.com/grades', { headers: { 'Authorization': $localstorage.get('token') } }).then(function(resp) {
      var grades = resp.data;

      if (grades.length == 0){ //TODO fix when response is 401 instead empty response
        $localstorage.remove('token');
        alert('Sua sessão expirou. Por favor faça login novamente.');
        $state.go("app.login");
      }

      for (var idx in grades) {
        var grade = resp.data[idx];
        grade.id = idx;
        $localstorage.setObject('grades-' + grade.id, grade);
      }

      $scope.grades = grades;
    }, function(err) {
      console.error('ERR', err);
    });
  });

})

.controller('GradeCtrl', function($scope, $stateParams, $localstorage) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.grade = $localstorage.getObject('grades-' + $stateParams.gradeId);
  });

  $scope.iconForGrade = function(grade) {
    var grade = parseFloat(grade.replace(',', '.'));
    var classes = '';

    if (isNaN(grade)) {
      classes = 'hide';
    } else if (grade >= 6.0) {
      classes = 'ion-checkmark-circled balanced';
    } else {
      classes = 'ion-close-circled assertive';
    }

    return classes;
  };
})

.controller('LoginCtrl', function($scope, $http, $localstorage, $state){

  // Form data for the login modal
  $scope.loginData = {};

  $scope.$on('$ionicView.enter', function(e) {
    if ($localstorage.get('token') !== undefined) {
      $state.go("app.grades");
    }
  });

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    var dataString = 'ra=' + $scope.loginData.ra + '&password=' + $scope.loginData.password;

    $http.post('https://uniara-virtual-api.herokuapp.com/login', dataString, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function(resp) {
      $localstorage.set('token', resp.data);
    }, function(err) {
      console.error('ERR', err);
    });

  };
});
