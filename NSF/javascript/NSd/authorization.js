// NSF/NSd/authorization.js
// Description:
// "authorization.js" provide authorization actions.
// Copyright 2018 NOOXY. All Rights Reserved.

// Handling responses to authorization requests.
function AuthorizationHandler() {
  let _implementation_module = null;

  let _implts_callback = {
    'PW': () => {

    },

    'TK': (connprofile, data, data_sender) => {
      let AuthbyToken = _implementation_module.returnImplement('AuthbyToken');
      AuthbyToken((err, username, token)=>{
        let _data = {
          m:'TK',
          d:{
            u: username,
            t: token
          }
        }
        data_sender(connprofile, 'AU', 'rs', _data);
      })
    },

    'AC': () => {

    }
  };

  this.RqRouter = (connprofile, data, data_sender) => {
    _implts_callback[data.m](connprofile, data, data_sender);
  };

  this.importImplementationModule = (implementation_module) => {
    _implementation_module = implementation_module;
  };
};

// Serverside authorization emitter.
function Authorization() {
  let _realtime_token = null;
  let _trusted_domains = [];
  let _authe_module = null;
  let _entity_module = null;
  let _auth_timeout = 320;
  let _queue_operation = {};

  this.emitRouter = () => {console.log('[*ERR*] emit not implemented');};

  this.RsRouter = (connprofile, data) => {
    let op = _queue_operation[connprofile.returnGUID()+data.m];
    console.log(_queue_operation);
    op(connprofile, data);
  };

  // function that import working authenticity module.
  this.importAuthenticityModule = (authe_module) => {
    _authe_module = authe_module;
  };
  //
  this.importEntityModule = (entity_module) => {
    _entity_module = entity_module;
  };

  this.importTrustDomains = (domain_list) => {
    _trusted_domains = domain_list;
  };

  // Authby group
  this.Authby = {
    Password : (entityID, callback) =>{
      let user = _entity_module.returnVal('owner');
      let data = {
        m: "PW"
      }
      _entity_module.getEntityConnProfile(entityID, (err, connprofile) => {
        this.emitRouter(connprofile, 'AU', data);
        let op = (connprofile, data) => {
          if(user == data.d.u) {
            _authe_module.PasswordisValid(data.d.u, data.d.p, (isValid) => {
              if(isValid) {
                callback(false, true);
              }
              else {
                callback(false, false);
              }
            });
          }
          else {
            callback(false, false);
          }

        }
        _queue_operation[connprofile.returnGUID()+'PW'] = op;
      });

      // set the timeout of this operation
      setTimeout(() => {delete _queue_operation[connprofile.returnGUID()+'PW']}, _auth_timeout*1000);
    },

    Action : (entityID, callback) =>{

    },

    Token : (entityID, callback) =>{
        let user = _entity_module.returnEntityValue(entityID, 'owner');
        let data = {
          m: "TK"
        }
        _entity_module.getEntityConnProfile(entityID, (err, connprofile) => {
          let op = (connprofile, data) => {
            if(user === data.d.u) {
              _authe_module.TokenisValid(data.d.u, data.d.t, (isValid) => {
                if(isValid) {
                  callback(true);
                }
                else {
                  callback(false);
                }
              });
            }
            else {
              callback(false);
            }

          }
          _queue_operation[connprofile.returnGUID()+'TK'] = op;
          // set the timeout of clearing expired authorization.
          setTimeout(() => {delete _queue_operation[connprofile.returnGUID()+'TK']}, _auth_timeout*1000);
          this.emitRouter(connprofile, 'AU', data);
        });


    },

    UserLevel : (entityID, callback) =>{

    },

    RealtimeToken : (entityID, callback) =>{

    },

    Domain : (entityID, callback) => {
      if(_trusted_domains.includes(entityID.returnHostIP())) {
        callback(true);
      }
      else {
        callback(false);
      }
    }
  }

  this.getRealtimeToken = (callback) => {callback(_realtime_token);}

};

module.exports = {
  Authorization:Authorization,
  AuthorizationHandler: AuthorizationHandler
};