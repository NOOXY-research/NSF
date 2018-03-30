// NSF/NSd/connection.js
// Description:
// "connection.js" provide connection interface.
// Copyright 2018 NOOXY. All Rights Reserved.


let Utils = require('./utilities');
let WebSocketServer = require('ws').Server;

function ConnectionProfile(conn) {

  let _GUID = null;

  if(!(_GUID === null)) {
    _GUID = utils.generateGUID();
  }

  this.getGUID = function() {
    return _GUID;
  }

  this.getIPaddress() = function() {

  }
}

function WSServer() {

  let _wss = null;
  let _clients = {};
  let _connprofiles = {};

  this.onJSON = function(json, connprofile) {};

  this.sendJSON = function(json, connprofile) {
    _clients[connprofile.getGUID()].send(JSON.stringify(json));
  };

  this.broadcast = function(json) {
    this._wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(json));
      }
    });
  };

  this.start = function(port, origin = false) {
    // launch
    _wss = new WebSocketServer({port: port});

    _wss.on('connection', function(ws) {

        let originDomain = URL.parse(ws.upgradeReq.headers.origin).hostname;
        let connprofile = new ConnectionProfile(ws);
        clients[connprofile.generateGUID()] = ws;

        // if (configuration.origins.indexOf(originDomain) < 0) {
        //     ws.send(JSON.stringify({
        //         method : 'notify',
        //         session : 'req',
        //         data : 'Connection from unknown source refused.'
        //     }));
        //
        //     ws.close();
        //     return;
        // }

        ws.on('message', function(message) {
          this.onJSON(JSON.phrase(message), connprofile);
        });

        ws.on('error', function(error) {
            console.log('[ERROR] %s', error);
            ws.close();
        });

        ws.on('close', function() {
            var index = Utils.searchObject(clients, client);
            delete clients[index];
        });

    });
  }
}

module.exports = {
  WSServer: WSServer;
  TCPServer: null;
};
