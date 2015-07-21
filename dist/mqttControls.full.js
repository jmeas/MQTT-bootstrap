angular.module("Mqtt.Controls", ["Mqtt.Services"]);
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
    	"<form action='.'>" 
    	+ "	<input type='text' id='{{::uniqueId}}'></input>"
    	+ "	<input type='button' value='Publish' ng-click='sendMessage()' />"
    	+ "</form>"
  }
});
