angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicHistory, $localstorage, $ionicModal, $state, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  $scope.logout = function() {
    $localstorage.clear();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go("app.login");
  }
})

.controller('GradesCtrl', function($scope, $localstorage, $state) {

  $scope.$on('$ionicView.enter', function(e) {

    if ($localstorage.getObject('token').expires > Date.now()) {
      $scope.grades = $localstorage.getObject('grades');
    } else {
      $localstorage.remove('token');
      alert('Sua sessão expirou. Por favor faça login novamente.');
      $state.go("app.login");
    }

  });

})


.controller('GradeCtrl', function($scope, $stateParams, $localstorage) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.grade = $localstorage.getObject('grades-' + $stateParams.gradeId);
  });

  $scope.iconForGrade = function(grade) {
    var classes = '';

    if (grade === undefined) {
      return classes;
    }

    var grade = parseFloat(grade.replace(',', '.'));

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

.controller('HomeCtrl', function($scope, $http, $localstorage, $state) {

  $scope.$on('$ionicView.enter', function(e) {

    //TODO we will refactor to move all this token check to a specific method.. wait for it.....
    if ($localstorage.getObject('token').expires > Date.now()) {
      if ($localstorage.get('profile') == undefined) {
        $http.get('https://uniara-virtual-api.herokuapp.com/student', { headers: { 'Authorization': $localstorage.getObject('token').value } }).then(function(resp) {
          $localstorage.setObject('profile', resp.data);
          $scope.profile = resp.data
        });
      }
      $scope.profile = $localstorage.getObject('profile');
    } else {
      $localstorage.remove('token');
      $localstorage.remove('profile');
      alert('Sua sessão expirou. Por favor faça login novamente.');
      $state.go("app.login");
    }

  });

})

.controller('LoginCtrl', function($scope, $http, $localstorage, $state, $ionicHistory, $ionicLoading){

  // Form data for the login modal
  $scope.loginData = {};

  $scope.$on('$ionicView.enter', function(e) {
    if ($localstorage.get('token') !== undefined) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go("app.home");
    }
  });

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    var dataString = 'ra=' + $scope.loginData.ra + '&password=' + $scope.loginData.password;

    $ionicLoading.show({
      template: 'Realizando login...'
    });

    $http.post('https://uniara-virtual-api.herokuapp.com/login', dataString, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function(resp) {
      var expires = Date.now() + (30*60*60*1000); // Now + 30 minutes

      $localstorage.setObject('token', { value: resp.data, expires: expires });

      $http.get('https://uniara-virtual-api.herokuapp.com/grades', { headers: { 'Authorization': $localstorage.getObject('token').value } }).then(function(resp) {
        var grades = resp.data;

        if (grades.length == 0){ //TODO fix when response is 401 instead empty response
          $localstorage.remove('token');
          $localstorage.remove('profile');
          alert('Sua sessão expirou. Por favor faça login novamente.');
          $state.go("app.login");
        }

        for (var idx in grades) {
          var grade = grades[idx];
          grade.id = idx;
          $localstorage.setObject('grades-' + grade.id, grade);
        }

        $localstorage.setObject('grades', grades);

        $ionicLoading.hide();

        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("app.home");
      }, function(err) {
        $ionicLoading.hide();
        alert('Ocorreu um erro ao realizar o login. Por favor tente novamente.')
        console.error('ERR', err);
      });

    }, function(err) {
      $ionicLoading.hide();
      alert('Ocorreu um erro ao realizar o login. Por favor tente novamente.')
      console.error('ERR', err);
    });

  };
});
