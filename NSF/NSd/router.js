// NSF/NSd/router.js
// Description:
// "router.js" provide routing functions.
// Copyright 2018 NOOXY. All Rights Reserved.

function Router() {
  let _coregateway = null;
  // for signup timeout
  let _locked_ip = [];

  // in case of wrong session of the position
  let _sessionnotsupport = function() {
    console.log('[ERR] session not support');
  }

  // a convinient function fo sending data
  let _senddata = function(connprofile, method, session, data) {
    var wrapped = {
      m : method,
      s : session,
      d : data
    };

    // finally sent the data through the connection.
    _coregateway.conn.sendJSON(connprofile, wrapped);
  }

  // implementations of NOOXY Service Protocol methods
  let methods = {
    // nooxy service protocol implementation of "signup"
    SU: {

    },

    // nooxy service protocol implementation of "get token"
    GT: {
      emitter : (connprofile, username, password) => {
        _senddata('GT', 'rq', {username : username, password : password});
      },

      handler : (connprofile, session, data, coregateway) => {
        let rq_rs_pos = {
          rq: "Client",
          rs: "Server"
        }

        let actions = {
          rq : function(connprofile, data) {
                let responsedata = {};
                _coregateway.authorization.getToken(data.username, data.password, (token)=>{
                  responsedata['t'] = token;
                  _senddata(connprofile, 'GT', 'rs', responsedata);
                });
            });
          },

          rs : function(connprofile, data) {

          }
        }
        connprofile.getPosition((pos)=> {
          if(rq_rs_pos[session] == pos) {
            actions[session](connprofile, data);
          }
          else {
            _sessionnotsupport();
          }
        })
      }
    },

    // nooxy service protocol implementation of "kill token"
    KT: {

    },

    // nooxy service protocol implementation of "Authorization"
    AU: {
      emitter : (connprofile, data) => {
        _senddata('AU', 'rq', data);
      },

      handler : (connprofile, session, data, coregateway) => {
        let rq_rs_pos = {
          rq: "Server",
          rs: "Client"
        }

        let actions = {
          rq : _coregateway.AuthorationHandler.RqRouter(connprofile, data, _senddata),
          rs : _coregateway.Authoration.RsRouter(connprofile, data)
        }
        connprofile.getPosition((pos)=> {
          if(rq_rs_pos[session] == pos) {
            actions[session](connprofile, data);
          }
          else {
            _sessionnotsupport();
          }
        })
      }
    },

    // nooxy service protocol implementation of "Call Service"
    CS: {

    },

    // nooxy service protocol implementation of "Call Activity"
    CA: {

    }
  }

  // emit specified method.
  this.emit = (connprofile, method, data) => {methods[method].emitter(connprofile, data)};

  // import the accessbility of core resource
  this.setup = function(coregateway) {
    _coregateway = coregateway;
  };

  // start this router
  this.start = function() {
    _coregateway.Authenticity.emitRouter = this.emit;
    _coregateway.Service.emitRouter = this.emit;
    _coregateway.conn.onJSON = function(connprofile, json) {
      methods[json.method].handler(connprofile, json.session, json.data, coregateway);
    };
  };
}

module.exports = Router