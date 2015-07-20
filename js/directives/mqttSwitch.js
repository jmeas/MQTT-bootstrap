app.directive('mqttSwitch', function(){
  return {
    restrict: 'AE',
    require: '^ngModel',
    template: "<div style='display:inline-block; width: 40px; background-color: #3333ff; height:{{temp}}px'>Temp</div>"
  }
});
