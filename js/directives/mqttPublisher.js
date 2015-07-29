angular.module("Mqtt.Controls").directive('mqttPublisher', function(){
  return {
    restrict: 'E',
    scope: {},
    require: '^?mqttPanel',
    controller: ["$scope", "mqtt", function($scope, mqtt){
        ///////////////////////////////////////////////////////
        // only a fallback for if this tag isn't in an mqtt-panel
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
	    $scope.sendMessage = function(){
	    	mqtt.sendMessage(
	    		document.getElementById($scope.uniqueId).value,
	    		topic, host, port, user, pass, useSSL);
	    };
        ///////////////////////////////////////////////////////
	    $scope.chart = undefined;
	    $scope.uniqueId = "myPub" + $scope.$id;
    }],
    link: function(scope, element, attributes, mqttPanelController){
		var callback = function(message){
			var tmp = message.payloadString;
			document.getElementById(scope.uniqueId).value=tmp;
			scope.$apply();
		};
		if(attributes.host && attributes.host.length){
	    	scope.connect(attributes.host, parseInt(attributes.port),
	    		attributes.user, attributes.pass, 
	    		attributes.useSsl == "true", attributes.topic,
	    		callback);
		}else if(mqttPanelController != undefined){
            scope.$on('ready-to-connect', function(event, arg){
                mqttPanelController.connect(attributes.topic, callback);
                // overwrite send message with call to panel
                scope.sendMessage = function(){
                    mqttPanelController.sendMessage(
                        attributes.topic,
                        document.getElementById(scope.uniqueId).value);
                }
            });
		}
    },
    replace: true,
    template:
    	"<form ng-submit='sendMessage()'>" 
    	+ "	<input type='text' id='{{::uniqueId}}'></input>"
    	+ "	<input type='submit' value='Publish' />"
    	+ "</form>"
  }
});
