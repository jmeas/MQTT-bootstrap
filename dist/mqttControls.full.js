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
						for(var x = 0; x < scope.chart.datasets[0].bars.length; x++)
						{
							var bar = scope.chart.datasets[0].bars[x];
							if(bar.label == nm){
								found = true;
								bar.value = tmp;
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
					var emptyInd = -1;
					for(var x = 0; x < scope.chart.segments.length; x++){
						var seg = scope.chart.segments[x];
						if(seg.label == nm){
							seg.value = tmp;
							found = true;
						}
						if(seg.label != "empty")
						{
							sum += scope.chart.segments[x].value;
						}else{
							emptyInd = x;
						}
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
					scope.chart.segments[emptyInd].value = max - sum;
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
    	"<form ng-submit='sendMessage()'>" 
    	+ "	<input type='text' id='{{::uniqueId}}'></input>"
    	+ "	<input type='submit' value='Publish' />"
    	+ "</form>"
  }
});

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
    	scope.topic = attributes.topic;
    },
    replace: true,
    template:
    	"<form action='.'>" 
    	+ "	<input type='checkbox' id='{{::uniqueId}}' ng-click='sendMessage()'></input>"
    	+ " <label for='{{::uniqueId}}'>{{topic}}</label>"
    	+ "</form>"
  }
});
