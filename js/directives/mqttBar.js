angular.module("Mqtt.Controls").directive('mqttBar', function(){
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
				if(max == undefined) {max = tmp * 1.2;}
				if(scope.chart == undefined){
					scope.chart = new Chart(ctx)
						.Bar(
							{
								labels: [message.destinationName],
								datasets: [{
						            //label: "My First dataset",
						            fillColor: "rgba(220,220,220,0.5)",
						            strokeColor: "rgba(220,220,220,0.8)",
						            highlightFill: "rgba(220,220,220,0.75)",
						            highlightStroke: "rgba(220,220,220,1)",
						            data: [tmp]
								}
								]
							}, {animationSteps : 50});
				
					}else{
						scope.chart.datasets[0].bars[0].value = tmp;
						scope.chart.update();
					}
					scope.$apply();
    		});
    },
    replace: true,
    template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
  }
});
