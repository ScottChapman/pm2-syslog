
// var pm2       = require('pm2');
const EventEmitter = require('events')
class Bus extends EventEmitter {
  constructor() {
    super();
  }
}

class PM2 {
  constructor() {
    this.bus = new Bus();
  }
  launchBus(cb) {
    cb(null,this.bus);
  }
  bus() {
    return this.bus
  }
}

var pm2 = new PM2();

var os = require('os')
var SysLogger = require('ain2');
var logger    = new SysLogger({tag: 'pm2',  facility: 'local1', hostname: os.hostname()});

var loggers = {};

function getLogger(data) {
    var name = data.process.name + "(" + data.process.pm_id + ")";
    if (!loggers.hasOwnProperty(name)) {
      loggers[name] = new SysLogger({tag: name,  facility: 'local1', hostname: os.hostname()});
    }
    return loggers[name]
}

pm2.launchBus(function(err, bus) {
  bus.on('*', function(event, data){
    if (event == 'process:event') {
      logger.warn('app=pm2 target_app=%s target_id=%s restart_count=%s status=%s',
                  data.process.name,
                  data.process.pm_id,
                  data.process.restart_time,
                  data.event);
    }
  });

  bus.on('log:err', function(data) {
    getLogger(data).error('app=%s id=%s line=%s', data.process.name, data.process.pm_id, data.data);
  });

  bus.on('log:out', function(data) {
    getLogger(data).log('app=%s id=%s line=%s', data.process.name, data.process.pm_id, data.data);
  });
   bus.emit("log:out", {
     process: {
       name: "proc1",
       pm_id: "0"
     },
     data: "something"
   })
   bus.emit("log:err", {
     process: {
       name: "proc2",
       pm_id: "1"
     },
     data: "something"
   })
});

