describe("A test suite", function() {
  beforeEach(module("Mqtt.Services"));
  var msg = '';
  beforeEach('make sure you get the sub when you pub', inject(function(mqtt) {
    mqtt.connect('broker.mqttdashboard.com', 8000);
    mqtt.subscribe('testing-mqtt-dashboard', function(message) {
      msg = message.payloadString;
    }, 'broker.mqttdashboard.com', 8000);
    mqtt.sendMessage('hi', 'testing-mqtt-dashboard', 'broker.mqttdashboard.com', 8000);
  }));
  it('make sure you get the sub when you pub', function(done) {
    setTimeout(function() {
      expect(msg).equals('hi');
      done();
    }, 1500);
  })
});