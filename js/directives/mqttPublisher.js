angular.module("Mqtt.Controls").directive('mqttPublisher', function(){
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
	    $scope.uniqueId = "myPub" + $scope.$id;
	    $scope.sendMessage = function(){
	    	mqtt.sendMessage(
	    		document.getElementById($scope.uniqueId).value,
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
				document.getElementById(scope.uniqueId).value=tmp;
				scope.$apply();
    		});
    },
    replace: true,
    template:
    	"<form ng-submit='sendMessage()'>" 
    	+ "	<input type='text' id='{{::uniqueId}}'></input>"
    	+ "	<input type='submit' value='Publish' />"
    	+ "</form>"
  }
});
