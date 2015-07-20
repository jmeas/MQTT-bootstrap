angular.module("Mqtt.Controls").directive('mqttDoughnut', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: ["$scope", "mqtt", function($scope, mqtt){
	    $scope.connect = function(host, port, user, pass,
	    	useSSL, topic, callback){
		    mqtt.connect(host, port, user, pass, useSSL);
		    mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
	    }
	    $scope.chart = undefined;
	    $scope.uniqueId = "myChart" + $scope.$id;
    }],
    link: function(scope, element, attributes, ctrl){
    	var max = attributes.maxValue;
    	scope.connect(attributes.host, parseInt(attributes.port),
    		attributes.user, attributes.pass, 
    		attributes.useSsl == "true", attributes.topic,
    		function(message){
				var tmp = parseInt(message.payloadString);
				var ctx = document.getElementById(scope.uniqueId).getContext("2d");
				if(max == undefined) {max = parseInt(tmp) * 1.2;}
				if(scope.chart == undefined){
					scope.chart = new Chart(ctx)
						.Doughnut([
							{
								value: tmp,
								color: (tmp>80?"#F7464A":"#46BFBD"),
								highlight: (tmp>80?"#FF5A5E":"#5AD3D1"),
								label: message.destinationName
							},
							{
								value: max - tmp,
								color: "#FFFFFF",
								highlight: "#FFFFFF",
								label: "empty"
							}
						], {animationSteps : 50});
				}else{
					scope.chart.segments[0].value = tmp;
					scope.chart.segments[1].value = max - tmp;
					scope.chart.update();
				}
					scope.$apply();
    		});
    },
    replace: true,
    template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
  }
});
