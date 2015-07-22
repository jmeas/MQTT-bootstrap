angular.module("Mqtt.Controls").directive('mqttOnOffSwitch', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: ["$scope", "mqtt", function($scope, mqtt){
    	var host,port,user,pass,useSSL,topic;
	    $scope.connect = function(hostp, portp, userp, passp,
	    	useSSLp, topicp, callback){
		    mqtt.connect(hostp, portp, userp, passp, useSSLp);
		    mqtt.subscribe(topicp, callback, hostp, portp, userp, passp, useSSLp);
		    host = hostp;
		    port = portp;
		    user = userp;
		    pass = passp;
		    useSSL = useSSLp;
		    topic = topicp;
	    }
	    $scope.chart = undefined;
	    $scope.uniqueId = "myChk" + $scope.$id;
	    $scope.sendMessage = function(){
	    	mqtt.sendMessage(
	    		document.getElementById($scope.uniqueId).checked?"on":"off",
	    		topic, host, port, user, pass, useSSL);
	    };
    }],
    link: function(scope, element, attributes, ctrl){
    	var max = attributes.maxValue;
    	scope.connect(attributes.host, parseInt(attributes.port),
    		attributes.user, attributes.pass, 
    		attributes.useSsl == "true", attributes.topic,
    		function(message){
				var tmp = message.payloadString;
				document.getElementById(scope.uniqueId).checked=tmp == "on";
				scope.$apply();
    		});
    },
    replace: true,
    template:
    	"<form action='.'>" 
    	+ "	<input type='checkbox' id='{{::uniqueId}}' ng-click='sendMessage()'></input>"
    	+ "</form>"
  }
});
