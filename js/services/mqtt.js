
angular.module("Mqtt.Services", [])
  .factory("mqtt", function() {
    var mqttObj = {};
    var toSubscribe = {};
    var toSend = {};
    var connections = {};
    var currentAttempts = {};
    var subscriptions = {};

    // using named parameters because 
    mqttObj.connect = function(host, port, user, pass, useSSL, clientId) {
      var retry;
      if (clientId == undefined) {
        clientId = guid();
      }
      var key = getHashKey(host, port, user, pass, useSSL);
      // remember to deal with current attempted connections
      if (connections[key] == undefined && currentAttempts[key] == undefined) {
        // Create a client instance
        var client = new Paho.MQTT.Client(host, port, clientId);
        currentAttempts[key] = client;

        // set callback handlers
        client.onConnectionLost = function(responseObject) {
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
          }
          // auto-reconnect
          retry = setInterval(function() {
            mqttObj.connect(host, port, user, pass, useSSL, clientId);
          }, 5000);
        };
        client.onMessageArrived = function(message) {
          console.log("onMessageArrived:" + message.payloadString);
          var newKey = key + "||" + message.destinationName;
          var subs = subscriptions[newKey];
          if (subs != undefined) {
            for (var sub = 0; sub < subs.length; sub++) {
              subs[sub](message);
            }
          }
        };


        // connect the client
        client.connect({
          onSuccess: function() {
            // got connected, kill auto-retry
            clearInterval(retry);
            console.log("onConnect");
            connections[key] = client;
            currentAttempts[key] = undefined;
            var ts = toSubscribe[key];
            if (ts != undefined) {
              for (var x = 0; x < ts.length; x++) {
                mqttObj.subscribe(ts[x].topic, ts[x].callback, host, port, user, pass, useSSL, clientId);
              }
              toSubscribe[key] = [];
            }
            var tse = toSend[key];
            if (tse != undefined) {
              for (var x = 0; x < tse.length; x++) {
                mqttObj.sendMessage(tse[x].msg, tse[x].topic, host, port, user, pass, useSSL);
              }
            }
          }
          , onFailure: function() {
            // auto-retry
            retry = setInterval(function() {
              console.log('failed connection to MQTT broker ' + host + ', retrying now')
              mqttObj.connect(host, port, user, pass, useSSL, clientId);
            }, 5000);
          }
          , userName: user || ''
          , password: pass || ''
          , useSSL: useSSL
        });
      }
    }

    mqttObj.subscribe = function(topic, callback, host, port, user, pass, useSSL, clientId) {
      var key = getHashKey(host, port, user, pass, useSSL)
      var client = connections[key];
      if (client == undefined) {
        if (toSubscribe[key] == undefined) {
          toSubscribe[key] = [];
        }
        // TODO: add limits to this hashtable
        toSubscribe[key].push({
          topic: topic
          , callback: callback
        });
        // do the connect
        mqttObj.connect(host, port, user, pass, useSSL, clientId);
      } else {
        client.subscribe(topic);
        var newKey = key + "||" + topic;
        if (subscriptions[newKey] == undefined) {
          subscriptions[newKey] = [];
        }
        subscriptions[newKey].push(callback);
      }
    }

    mqttObj.sendMessage = function(msg, topic, host, port, user, pass, useSSL) {
      var key = getHashKey(host, port, user, pass, useSSL)
      var client = connections[key];
      if (client == undefined) {
        // allow for "offline" sending (queueing)
        if (toSend[key] == undefined) {
          toSend[key] = [];
        }
        // TODO: add limits to this hashtable
        toSend[key].push({
          msg: msg
          , topic: topic
        });
      } else {
        console.log('sending "' + msg + '"');
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        client.send(message);
      }
    };

    /*------ private functions -------*/
    // called when the client loses its connection
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
      }
    };

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    function getHashKey(h, po, u, pa, s) {
      return h + '||' + po + '||' + u + '||' + pa + '||' + s;
    }
    /*---------------------------------------*/
    return mqttObj;
  });