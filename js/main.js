var tmpTemp = 0;
var app = angular.module('MqttDash', ["Mqtt.Controls"])
  .controller('timeSeries', function($scope, mqtt){
  	setInterval(function(){
  		mqtt.connect("broker.mqttdashboard.com", 8000, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541', 'pv4ijDlTbjghPaHbT85T6ArPSH3J3a7gosJNN6vm8UU=', true, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541');
  		mqtt.sendMessage(
	    		(Math.random() * 100) + "",
	    		"MQTTBootstrap/Testing", "broker.mqttdashboard.com", 8000, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541', 'pv4ijDlTbjghPaHbT85T6ArPSH3J3a7gosJNN6vm8UU=', true, '69e9ea4e-deea-4a03-b8b8-7b15f5c7a541');
  		mqtt.sendMessage()
  	}, 1000);
  });
