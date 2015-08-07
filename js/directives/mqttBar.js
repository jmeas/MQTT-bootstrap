angular.module('Mqtt.Controls')
  .directive('mqttBar', function() {
    return {
      restrict: 'E',
      scope: {},
      require: '^?mqttPanel',
      controller: ['$scope', 'mqtt',
        function($scope, mqtt) {
          ///////////////////////////////////////////////////////
          // only a fallback for if this tag isn't in an mqtt-panel
          $scope.connect = function(host, port, user, pass, useSSL, topic, clientId, callback) {
            mqtt.connect(host, port, user, pass, useSSL, clientId);
            mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
          }
          ///////////////////////////////////////////////////////
          $scope.uniqueId = 'myChart' + $scope.$id;
        }
      ],
      link: function(scope, element, attributes, mqttPanelController) {
        var callback = function(message) {
          // parse msg, can be just a number or <name>=<value>
          var tmp;
          var nm = message.destinationName;
          if (message.payloadString.indexOf('=') > 0) {
            var data = message.payloadString.split('=');
            var nm = data[0].trim();
            tmp = parseFloat(data[1].trim());
          } else {
            tmp = parseFloat(message.payloadString);
          }
          if (nm.length > 40) nm = nm.substring(0, 40) + '...';


          if (scope.chart == undefined) {
            // get chart
            var ctx = document.getElementById(scope.uniqueId)
              .getContext('2d'); // new chart, create it
            scope.chart = new Chart(ctx)
              .Bar({
                labels: [nm],
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
            var found = false;
            for (var x = 0; x < scope.chart.datasets[0].bars.length; x++) {
              var bar = scope.chart.datasets[0].bars[x];
              if (bar.label == nm) {
                found = true;
                bar.value = tmp;
              }
            }
            if (!found) {
              scope.chart.addData([tmp], nm);
            }
            scope.chart.update();
          }
          scope.$apply();
        };

        if (attributes.host && attributes.host.length) {
          scope.connect(attributes.host, parseInt(attributes.port), attributes.user, attributes.password, attributes.useSsl == 'true', attributes.topic, attributes.clientId, callback);
        } else if (mqttPanelController != undefined) {
          scope.$on('ready-to-connect', function(event, arg) {
            mqttPanelController.connect(attributes.topic, callback);
          });
        }
      },
      replace: true,
      template: '<canvas id="{{::uniqueId}}"></canvas>'
    }
  });