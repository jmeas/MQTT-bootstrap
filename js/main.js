
var tmpTemp = 0;
var app = angular.module('MqttDash', ["Mqtt.Controls"])
  .controller('timeSeries', function($scope, mqtt) {
    setInterval(function() {
      mqtt.connect("broker.mqttdashboard.com", 8000, '', '', false);
      mqtt.sendMessage(
        (Math.random() * 100) + ""
        , "MQTTBootstrap/Testing", "broker.xively.com", 8000, '', '', false);
      mqtt.sendMessage()
    }, 1000);
  });