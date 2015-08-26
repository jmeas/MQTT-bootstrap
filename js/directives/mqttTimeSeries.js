angular.module('Mqtt.Controls')
  .directive('mqttTimeSeries', function () {
    return {
      restrict: 'E',
      scope: {},
      require: '^?mqttPanel',
      controller: ['$scope', 'mqtt',
        function ($scope, mqtt) {
          ///////////////////////////////////////////////////////
          // only a fallback for if this tag isn't in an mqtt-panel
          $scope.connect = function (host, port, user, pass, useSSL, topic, clientId, callback) {
            mqtt.connect(host, port, user, pass, useSSL, clientId);
            mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
          };
          ///////////////////////////////////////////////////////
          $scope.chart = undefined;
          $scope.uniqueId = 'myChart' + $scope.$id;
        }
      ],
      link: function (scope, element, attributes, mqttPanelController) {
        var maxPoints = 20;
        if (attributes.maxPoints && !isNaN(parseInt(attributes.maxPoints))) {
          maxPoints = parseInt(attributes.maxPoints);
        }
        var interval = 500;
        if (attributes.interval && !isNaN(parseInt(attributes.interval))) {
          interval = parseInt(attributes.interval);
        }
        scope.curValue = 0;

        var callback = function (message) {
          if (attributes.transform != undefined && window[attributes.transform] != undefined) {
            msg = window[attributes.transform](message.payloadString);
          }
          tmp = parseFloat(msg);
          scope.curValue = tmp;
        };
        var tmp = 0;
        setInterval(function () {
          // get chart
          var ctx = document.getElementById(scope.uniqueId)
            .getContext('2d');
          if (scope.chart == undefined) {
            // new chart, create it
            scope.chart = new Chart(ctx)
              .Line({
                labels: [getDate()],
                datasets: [{
                  label: 'main',
                  fillColor: 'rgba(220,220,220,0.5)',
                  strokeColor: 'rgba(220,220,220,0.8)',
                  highlightFill: 'rgba(220,220,220,0.75)',
                  highlightStroke: 'rgba(220,220,220,1)',
                  data: [tmp]
                }],
              }, {
                animationSteps: 50
              });
          } else {
            // have a chart, update data
            scope.chart.addData([tmp], getDate());
            if (scope.chart.datasets[0].points.length > maxPoints) {
              scope.chart.removeData();
            }
            scope.chart.update();
          }
          scope.$apply();
        }, interval);

        if (attributes.host && attributes.host.length) {
          scope.connect(attributes.host, parseInt(attributes.port), attributes.user, attributes.password,
            attributes.useSsl == 'true', attributes.topic, attributes.clientId, callback);
        } else if (mqttPanelController != undefined) {
          scope.$on('ready-to-connect', function (event, arg) {
            mqttPanelController.connect(attributes.topic, callback);
          });
        }
      },
      replace: true,
      template: '<canvas id="{{::uniqueId}}"></canvas>'
    };
  });
var getDate = function () {
  var dt = new Date();
  var dtS = dt.getHours() + ':' + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : '' + dt.getMinutes()) +
    ':' + (dt.getSeconds() < 10 ? '0' + dt.getSeconds() : '' + dt.getSeconds());
  return dtS;
};