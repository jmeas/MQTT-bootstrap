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
				var tmp;
				var nm = message.destinationName;
				if(message.payloadString.indexOf('=')>0){
					// TODO: split on =
					var data = message.payloadString.split('=');
					var nm = data[0];
					tmp = parseFloat(data[1]);
				}else{
					tmp = parseFloat(message.payloadString);
				}
				var ctx = document.getElementById(scope.uniqueId).getContext("2d");
				if(max == undefined) {max = parseInt(tmp) * 1.2;}
				if(scope.chart == undefined){
					scope.chart = new Chart(ctx)
						.Doughnut([
							{
								value: tmp,
								color: "#46BFBD",
								highlight: "#5AD3D1",
								label: nm
							},
							{
								value: max - tmp,
								color: "#FFFFFF",
								highlight: "#FFFFFF",
								label: "empty"
							}
						], {animationSteps : 50});
				}else{
					var sum = 0;
					var found = false;
					for(var x = 0; x < scope.chart.segments.length; x++){
						if(scope.chart.segments[x].label == nm){
							scope.chart.segments[x].value = tmp;
							found = true;
						}
						sum += scope.chart.segments[x].value;
					}
					if(!found){
						scope.chart.addData(
							{
								value: tmp,
								color: "#46BFBD",
								highlight: "#5AD3D1",
								label: nm
							}
						);
						sum += tmp;
					}
					scope.chart.segments[0].value = tmp;
					scope.chart.segments[1].value = max - sum;
					scope.chart.update();
				}
					scope.$apply();
    		});
    },
    replace: true,
    template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
  }
});
