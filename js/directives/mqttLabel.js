angular.module('Mqtt.Controls')
  .directive('mqttLabel', function () {
    return {
      restrict: 'E',
      scope: {},
      require: '^?mqttPanel',
      controller: ['$scope', 'mqtt',
        function ($scope, mqtt) {
          ///////////////////////////////////////////////////////
          // only a fallback for if this tag isn't in an mqtt-panel
          $scope.connect = function (hostp, portp, userp, passp, useSSLp, topicp, clientId,
            callback) {
            mqtt.connect(hostp, portp, userp, passp, useSSLp, clientId);
            mqtt.subscribe(topicp, callback, hostp, portp, userp, passp, useSSLp);
          };
          ///////////////////////////////////////////////////////
          $scope.uniqueId = 'myPub' + $scope.$id;
        }
      ],
      link: function (scope, element, attributes, mqttPanelController) {
        var callback = function (message) {
          var tmp = message.payloadString;
          if (attributes.transform != undefined && window[attributes.transform] != undefined) {
            tmp = window[attributes.transform](message.payloadString);
          }
          document.getElementById(scope.uniqueId)
            .innerHTML = tmp;
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
      template: '<span id="{{::uniqueId}}"></span>'
    };
  });