// NoService/NoService/runtime/create_core_instance.js
// Description:
// "create_core_instance.js" create a core instance.
// Copyright 2018-2019 NOOXY. All Rights Reserved.
'use strict';

const Constants = require('./constants');
const Core = require('./core');
const NoServiceLibaray = require('../../NoService');
let _core;
let _settings;

let terminateNoService = ()=> {
  process.send({t:0});
  process.exit();
};

let launchNoService = (msg)=> {
  _core = new Core(NoServiceLibaray, _settings);
  _core.onTerminated = terminateNoService;
  _core.onRelaunch = launchNoService;
  _core.checkandlaunch((err)=> {
    if(err) {
      process.exit(1);
    }
    else {
      process.send({t:1});
    }
  });
};


// Checking dependencies
for(let pkg in Constants.dependencies) {
  try {
    require.resolve(Constants.dependencies[pkg]);
  } catch (e) {
    console.log('Please install package "'+Constants.dependencies[pkg]+'".');
    terminateNoService();
  }
}

console.log('NoService runtime process Id: ' + process.pid);
console.log('NoService runtime starting directory: ' + process.cwd());

process.on('message', (msg)=> {
  if(msg.t === 0) {
    process.title = msg.settings.daemon_name;
    if(msg.settings.path)
      process.chdir(msg.settings.path)
    _settings = msg.settings;
    launchNoService(msg);
  }
  else if(msg.t === 99) {
    _core.close();
  }
});

process.on('SIGINT', () => {
  console.log('NoService runtime Caught interrupt signal.');
  _core.close();
});

process.on('SIGTERM', () => {
  _core.close();
});

process.on('SIGINT', () => {
  _core.close();
});
