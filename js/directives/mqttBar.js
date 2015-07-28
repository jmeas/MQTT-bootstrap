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
	    $scope.labels = [];
    }],
    link: function(scope, element, attributes, ctrl){
    	//var max = attributes.maxValue;
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
				//if(max == undefined) {max = tmp * 1.2;}
				scope.labels.push(nm);
				if(scope.chart == undefined){
					scope.chart = new Chart(ctx)
						.Bar(
							{
								labels: [nm],
								datasets: [{
						            label: "main",
						            fillColor: "rgba(220,220,220,0.5)",
						            strokeColor: "rgba(220,220,220,0.8)",
						            highlightFill: "rgba(220,220,220,0.75)",
						            highlightStroke: "rgba(220,220,220,1)",
						            data: [tmp]
								}
								]
							}, {animationSteps : 50});
				
					}else{
						var found = false;
						for(var x = 0; x < scope.labels.length; x++)
						{
							var lbl = scope.labels[x];
							if(lbl.label == nm){
								found = true;
								scope.chart.datasets[0].data[x] = tmp;
							}
						}
						if(!found)
						{
							scope.chart.addData([tmp], nm);
						}
						//scope.chart.datasets[0].bars[0].value = tmp;
						scope.chart.update();
					}
					scope.$apply();
    		});
    },
    replace: true,
    template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
  }
});
