angular.module("Mqtt.Controls", ["Mqtt.Services"])
.directive('mqttPanel', function(){
	return {
		restrict: 'E',
		scope: {},
		controller: ['$scope', 'mqtt', '$rootScope',
		function($scope, mqtt, $rootScope){
			$scope.host = '';
			$scope.port = 0;
			$scope.user = '';
			$scope.pass = '';
			$scope.useSSL = false;
		    this.connect = function(topic, callback){
			    mqtt.connect(
			    	$scope.host, 
			    	$scope.port, 
			    	$scope.user, 
			    	$scope.pass, 
			    	$scope.useSSL);
			    mqtt.subscribe(
			    	topic, 
			    	callback, 
			    	$scope.host, 
			    	$scope.port, 
			    	$scope.user, 
			    	$scope.pass, 
			    	$scope.useSSL);
		    };
		    this.sendMessage = function(topic, message){
		    	mqtt.sendMessage(
		    		message,
		    		topic,
		    		$scope.host,
		    		$scope.port,
		    		$scope.user,
		    		$scope.pass,
		    		$scope.useSSL);
		    };
		    this.ready = function(){
		    	// TODO: figure out why this has to be root scope
	    		$rootScope.$broadcast('ready-to-connect', {});
		    };
		}],
		link: function(scope, element, attributes, ctrl){
			scope.host = attributes.host;
			scope.port = parseInt(attributes.port);
			scope.user = attributes.user;
			scope.useSSL = attributes.useSSL == 'true';
			ctrl.ready();
		},
	}
});

angular.module("Mqtt.Controls").directive('mqttBar', function(){
	return {
		restrict: 'E',
		scope: {},
		require: '^?mqttPanel',
		controller: ["$scope", "mqtt", function($scope, mqtt){
	    	///////////////////////////////////////////////////////
	    	// only a fallback for if this tag isn't in an mqtt-panel
	    	$scope.connect = function(host, port, user, pass,
	    		useSSL, topic, callback){
	    		mqtt.connect(host, port, user, pass, useSSL);
	    		mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
	    	}
	    	///////////////////////////////////////////////////////
	    	$scope.chart = undefined;
	    	$scope.uniqueId = "myChart" + $scope.$id;
	    }],
	    link: function(scope, element, attributes, mqttPanelController){
	    	var callback = function(message){
	    		// parse msg, can be just a number or <name>=<value>
	    		var tmp;
	    		var nm = message.destinationName;
	    		if(message.payloadString.indexOf('=')>0){
	    			var data = message.payloadString.split('=');
	    			var nm = data[0].trim();
	    			tmp = parseFloat(data[1].trim());
	    		}else{
	    			tmp = parseFloat(message.payloadString);
	    		}

	    		// get chart
	    		var ctx = document.getElementById(scope.uniqueId).getContext("2d");
				if(scope.chart == undefined){
					// new chart, create it
					scope.chart = new Chart(ctx)
					.Bar(
					{
						labels: [nm],
						datasets: [
							{
								label: "main",
								fillColor: "rgba(220,220,220,0.5)",
								strokeColor: "rgba(220,220,220,0.8)",
								highlightFill: "rgba(220,220,220,0.75)",
								highlightStroke: "rgba(220,220,220,1)",
								data: [tmp]
							}
						],
					}, {animationSteps : 50});
				}else{
					// have a chart, update data
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
					scope.chart.update();
				}
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
	    		});
	    	}
		},
		replace: true,
		template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
	}
});

angular.module("Mqtt.Controls").directive('mqttDoughnut', function(){
  return {
    restrict: 'E',
    scope: {},
	require: '^?mqttPanel',
    controller: ["$scope", "mqtt", function($scope, mqtt){
    	///////////////////////////////////////////////////////
    	// only a fallback for if this tag isn't in an mqtt-panel
	    $scope.connect = function(host, port, user, pass,
	    	useSSL, topic, callback){
		    mqtt.connect(host, port, user, pass, useSSL);
		    mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
	    }
    	///////////////////////////////////////////////////////
	    $scope.chart = undefined;
	    $scope.uniqueId = "myChart" + $scope.$id;
    }],
    link: function(scope, element, attributes, mqttPanelController){
    	var max = attributes.maxValue;
		var callback = function(message){
			var tmp;
			var nm = message.destinationName;
			if(message.payloadString.indexOf('=')>0){
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
		};
    	if(attributes.host && attributes.host.length){
	    	scope.connect(attributes.host, parseInt(attributes.port),
	    		attributes.user, attributes.pass, 
	    		attributes.useSsl == "true", attributes.topic,
	    		callback);
	    } else if(mqttPanelController != undefined){
    		scope.$on('ready-to-connect', function(event, arg){
    			mqttPanelController.connect(attributes.topic, callback);
    		});
	    }
    },
    replace: true,
    template: "<canvas id='{{::uniqueId}}' width='400' height='400'></canvas>"
  }
});

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

angular.module("Mqtt.Controls").directive('mqttOnOffSwitch', function(){
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
                document.getElementById($scope.uniqueId).checked?"on":"off",
                topic, host, port, user, pass, useSSL);
        };
        ///////////////////////////////////////////////////////
	    $scope.chart = undefined;
	    $scope.uniqueId = "myChk" + $scope.$id;
    }],
    link: function(scope, element, attributes, mqttPanelController){
        var callback = function(message){
            var tmp = message.payloadString;
            document.getElementById(scope.uniqueId).checked=tmp == "on";
            scope.$apply();
        };
        scope.topic = attributes.topic;
        if(attributes.host && attributes.host.length){
            scope.connect(attributes.host, parseInt(attributes.port),
                attributes.user, attributes.pass, 
                attributes.useSsl == "true", attributes.topic,
                callback);
        } else if(mqttPanelController != undefined){
            scope.$on('ready-to-connect', function(event, arg){
                mqttPanelController.connect(attributes.topic, callback);
                // overwrite send message with call to panel
                scope.sendMessage = function(){
                    mqttPanelController.sendMessage(
                        attributes.topic,
                        document.getElementById(scope.uniqueId).checked?"on":"off");
                }
            });
        }
    },
    replace: true,
    template:
    	"<form action='.'>" 
    	+ "	<input type='checkbox' id='{{::uniqueId}}' ng-click='sendMessage()'></input>"
    	+ " <label for='{{::uniqueId}}'>{{topic}}</label>"
    	+ "</form>"
  }
});

angular.module("Mqtt.Controls").directive('mqttTimeSeries', function(){
	return {
		restrict: 'E',
		scope: {},
		require: '^?mqttPanel',
		controller: ["$scope", "mqtt", function($scope, mqtt){
	    	///////////////////////////////////////////////////////
	    	// only a fallback for if this tag isn't in an mqtt-panel
	    	$scope.connect = function(host, port, user, pass,
	    		useSSL, topic, callback){
	    		mqtt.connect(host, port, user, pass, useSSL);
	    		mqtt.subscribe(topic, callback, host, port, user, pass, useSSL);
	    	}
	    	///////////////////////////////////////////////////////
	    	$scope.chart = undefined;
	    	$scope.uniqueId = "myChart" + $scope.$id;
	    }],
	    link: function(scope, element, attributes, mqttPanelController){
	    	var maxPoints = 20;
	    	if(attributes.maxPoints && parseInt(attributes.maxPoints) != NaN){
	    		maxPoints = parseInt(attributes.maxPoints);
	    	}
	    	var interval = 500;
	    	if(attributes.interval && parseInt(attributes.interval) != NaN){
	    		interval = parseInt(attributes.interval);
	    	}
	    	scope.curValue = 0;

	    	var callback = function(message){
    			tmp = parseFloat(message.payloadString);
    			scope.curValue = tmp;
    		}
    		setInterval(function(){
	    		// get chart
	    		var ctx = document.getElementById(scope.uniqueId).getContext("2d");
				if(scope.chart == undefined){
					// new chart, create it
					scope.chart = new Chart(ctx)
					.Line(
					{
						labels: [getDate()],
						datasets: [
							{
								label: "main",
								fillColor: "rgba(220,220,220,0.5)",
								strokeColor: "rgba(220,220,220,0.8)",
								highlightFill: "rgba(220,220,220,0.75)",
								highlightStroke: "rgba(220,220,220,1)",
								data: [tmp]
							}
						],
					}, {animationSteps : 50});
				}else{
					// have a chart, update data
					scope.chart.addData([tmp], getDate());
					if(scope.chart.datasets[0].points.length > maxPoints){
						scope.chart.removeData();
					}
					scope.chart.update();
				}
				scope.$apply();
			}, interval);

	    	if(attributes.host && attributes.host.length){
	    		scope.connect(attributes.host, parseInt(attributes.port),
	    			attributes.user, attributes.pass, 
	    			attributes.useSsl == "true", attributes.topic,
	    			callback);
	    	}else if(mqttPanelController != undefined){
	    		scope.$on('ready-to-connect', function(event, arg){
	    			mqttPanelController.connect(attributes.topic, callback);
	    		});
	    	}
		},
		replace: true,
		template: "<canvas id='{{::uniqueId}}' width='600' height='400'></canvas>"
	}
});
var getDate = function(){
	var dt = new Date();
	var dtS = dt.getHours() + ":" 
		+ (dt.getMinutes()<10?"0"+dt.getMinutes():""+dt.getMinutes()) + ":" 
		+ (dt.getSeconds()<10?"0"+dt.getSeconds():""+dt.getSeconds());
	return dtS;
}
