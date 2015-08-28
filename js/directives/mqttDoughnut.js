angular.module('Mqtt.Controls')
  .directive('mqttDoughnut', function () {
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
          $scope.uniqueId = 'myChart' + $scope.$id;
        }
      ],
      link: function (scope, element, attributes, mqttPanelController) {
        var max = attributes.maxValue;
        var callback = function (message) {
          var msg = message.payloadString;
          ///////////
          // TODO: extract this to a common function
          if (attributes.transform != undefined && window[attributes.transform] != undefined) {
            msg = window[attributes.transform](message.payloadString);
          }
          var tmp;
          var nm = message.destinationName;
          if (msg.indexOf('=') > 0) {
            var data = msg.split('=');
            var nm = data[0];
            tmp = parseFloat(data[1]);
          } else {
            tmp = parseFloat(msg);
          }
          ///////////
          var ctx = document.getElementById(scope.uniqueId)
            .getContext('2d');
          if (max == undefined) {
            max = parseInt(tmp) * 1.2;
          }
          if (scope.chart == undefined) {
            scope.chart = new Chart(ctx)
              .Doughnut([{
                value: tmp,
                color: '#46BFBD',
                highlight: '#5AD3D1',
                label: nm
              }, {
                value: max - tmp,
                color: '#FFFFFF',
                highlight: '#FFFFFF',
                label: 'empty'
              }], {
                animationSteps: 50
              });
          } else {
            var sum = 0;
            var found = false;
            var emptyInd = -1;
            for (var x = 0; x < scope.chart.segments.length; x++) {
              var seg = scope.chart.segments[x];
              if (seg.label == nm) {
                seg.value = tmp;
                found = true;
              }
              if (seg.label != 'empty') {
                sum += scope.chart.segments[x].value;
              } else {
                emptyInd = x;
              }
            }
            if (!found) {
              scope.chart.addData({
                value: tmp,
                color: '#46BFBD',
                highlight: '#5AD3D1',
                label: nm
              });
              sum += tmp;
            }
            scope.chart.segments[emptyInd].value = max - sum;
            scope.chart.update();
          }
          scope.$apply();
        };
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