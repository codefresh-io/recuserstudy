'use strict';

angular.module('recuserstudyApp')
  .controller('Step2Ctrl', function ($scope, $http, Modal, Movies, $state, $stateParams, $interval) {

    $scope.loading = true;


    if ($scope.id < 1 || $scope.id > 10) {
      $state.go('step1');
      return;
    }

    if (!Movies.user.length) {
      $state.go("step1");
      return;
    }
    else {
      var userMovies = Movies.user;
    }


    var afterSuccess = function (load) {
      if (!load)
        $scope.loading = false;
      else
        $interval(function () {
          $scope.loading = false;
        }, 500, 1);

      $scope.withImages = Movies.withImages;

      $scope.completed = Movies.completed;

      $scope.id = $stateParams.recId;

      var currentMovie = userMovies[$scope.id - 1];
      $scope.recommendations = [];

      currentMovie.recommend.map(function (id) {
        $scope.recommendations.push(Movies.recommendations[id]);
      });

      var step1Html = '' +
        '<p>In this step we are going to show you 10 sets of recommendations made by our system.<br>For each recommendation you are required to choose the movie that you will most like.<br>If none of the recommendations suits you please choose <b>"Nothing suits me</b>".</p>';
      var finishHtml = '' +
        '<p>Thanks for participating in the experiment.<br>We appreciate the time and effort you have made.</p>' +
        '<p>We will see you at the movies.</p>';


      if ($scope.id == 1 && !$scope.completed) {
        Modal.confirm.info()("Next Step", step1Html, "Got it");
      }

      $scope.continue = function (rec) {
        var firstTimeFinished = true;
        if ($scope.completed === 10) {
          firstTimeFinished = false;
        }

        if ($scope.id == 1 && !$scope.completed) {
          Modal.confirm.info()('Notice&nbsp&nbsp<span class="glyphicon glyphicon glyphicon-info-sign" aria-hidden="true"></span>', '<p>You can always return to previous recommendations and change your selection</p>', "Got it");
        }

        if (!userMovies[$scope.id - 1].choice) {
          Movies.completed++;
          $scope.completed++;
        }


        if (rec) {
          userMovies[$scope.id - 1].choice = rec;
        }
        else {
          userMovies[$scope.id - 1].choice = 'none';
        }

        if ($scope.id == 10 && firstTimeFinished) {
          Modal.confirm.confirm(function () {
            $scope.finish();
          })("That's it. You Finished", '<p>You can still change your mind to replace your choices if you wish or you can finish.</p>', "Finish");

        }
        else if ($scope.id < 10) {
          $state.go("step2", {recId: parseInt($scope.id) + 1});
        }

      };


      $scope.finish = function () {
        $scope.loading = true;
        $http.post('/api/movies/saveUserExperiment', {withImages: $scope.withImages, res: userMovies, age: Movies.age, gender: Movies.gender, bgu: Movies.bgu})
          .success(function () {
            Modal.confirm.info(function () {
              window.location.assign("http://www.imdb.com");
            })("That's it. You Finished", finishHtml, "Finish");
          })
          .error(function (err) {
            Modal.confirm.info(function () {
              $state.go('step1')
            })("Error", err, "Start from scratch");
          });
      };

      $scope.calcProgress = function () {
        var x = (($scope.completed) * 10).toString();
        return {width: x + '%'};
      };

      $scope.back = function () {
        $state.go('step2', {recId: parseInt($scope.id) - 1})
      }

      $scope.next = function () {
        $state.go('step2', {recId: parseInt($scope.id) + 1})

      }

      $scope.calcWell = function (rec) {
        if (userMovies[$scope.id - 1].choice && userMovies[$scope.id - 1].choice.name === rec.name) {
          return 'row recommend well chosen_rec'
        }
        else {
          return 'row recommend well'
        }
      };
    }

    if (!Movies.alreadyDecided) {
      $http.get('/api/movies/withImages')
        .success(function (res) {
          Movies.withImages = res;
          Movies.alreadyDecided = true;
          afterSuccess()
        })
        .error(function (err) {
          $scope.loading = false;
          Modal.confirm.info(function () {
            $state.go('step1')
          })("Error", err, "Start from scratch");
        });
    }
    else {
      afterSuccess(true);
    }

})
;
