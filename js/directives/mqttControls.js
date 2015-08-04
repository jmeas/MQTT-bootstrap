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
      $scope.clientId;
		    this.connect = function(topic, callback){
			    mqtt.connect(
			    	$scope.host, 
			    	$scope.port, 
			    	$scope.user, 
			    	$scope.pass, 
			    	$scope.useSSL,
            $scope.clientId);
			    mqtt.subscribe(
			    	topic, 
			    	callback, 
			    	$scope.host, 
			    	$scope.port, 
			    	$scope.user, 
			    	$scope.pass, 
			    	$scope.useSSL,
            $scope.clientId);
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
      scope.pass = attributes.password;
			scope.useSSL = attributes.useSsl == 'true';
      scope.clientId = attributes.clientId;
			ctrl.ready();
		},
	}
});
