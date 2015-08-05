
var tmpTemp = 0;
var app = angular.module('MqttDash', ["Mqtt.Controls"])
  .controller('timeSeries', function($scope, mqtt) {
    setInterval(function() {
      mqtt.connect("broker.xively.com", 443, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541', 'pv4ijDlTbjghPaHbT85T6ArPSH3J3a7gosJNN6vm8UU=', true, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541');
      mqtt.sendMessage(
        (Math.random() * 100) + ""
        , "xi/blue/v1/bc4ebe58-b070-437b-9a64-a112bb2283d8/d/a98750d3-2411-4b5e-8b94-e6e86e0c9823/Voltage", "broker.xively.com", 443, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541', 'pv4ijDlTbjghPaHbT85T6ArPSH3J3a7gosJNN6vm8UU=', true, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541');
      mqtt.sendMessage()
    }, 1000);
  });