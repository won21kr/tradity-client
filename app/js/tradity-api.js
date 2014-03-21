var enterDevMode = function(){};
var SoTradeConnection;
var SoTradeModel;

(function() {'use strict';

var logmsg = false;
var devmode = function() { return document.cookie.indexOf('devmode') != -1; };

function datalog() {
	if (!devmode()) {
		if (!logmsg) {
			console.log('For data debugging, please call enterDevMode() once.');
			logmsg = true;
		}
		
		return;
	}
	
	console.log.apply(console, arguments);
};

enterDevMode = function() {
	document.cookie = 'devmode=1;expires=Fri, 31 Dec 9999 23:59:59 GMT';
};

// socket.io wrapper object
SoTradeConnection = function(rawsocket) {
	this.socket = rawsocket;
	this.listeners = {}; // listener name -> array of callbacks
	this.ids = []; // numeric id -> {cb: callback for that id, prefill: object}
	this.id = 0;
	
	this.qCache = {};
	
	this.socket.on('response', this.responseHandler.bind(this));
	
	this.socket.on('push', (function(data) {
		datalog('!', data);
		
		this.invokeListeners(data);
	}).bind(this));
};

SoTradeConnection.prototype.invokeListeners = function(data, listener) {
	listener = listener || function() {};
	
	var type = data.type;
	
	// general listeners
	var listeners = this.listeners[type] || [];
	for (var i = 0; i < listeners.length; ++i) 
		if (listeners[i])
			listeners[i](data);
	
	// specific listener
	listener(data);
};

SoTradeConnection.prototype.responseHandler = function(data) {
	var rid = data['is-reply-to'].split('--');
	var type = rid[0];
	if ((type == 'login' || data.code == 'login-success') && data.key)
		this.setKey(data.key);
		
	var numericID = parseInt(rid[1]);
	var waitentry = this.ids[numericID];
	
	if (waitentry) {
		for (var i in waitentry.prefill) 
			if (typeof data[i] == 'undefined')
				data[i] = waitentry.prefill[i];
	}
	
	if (devmode()) {
		data._respsize = JSON.stringify(data).length;
		data._t_crecv = new Date().getTime();
		data._dt_cdelta   = data._t_crecv - data._t_csend;
		data._dt_inqueue  = data._t_srecv - data._t_csend;
		data._dt_sdelta   = data._t_ssend - data._t_srecv;
		data._dt_outqueue = data._t_crecv - data._t_ssend;
	}
	
	datalog('<', data);
	
	this.invokeListeners(data, waitentry.cb);
	
	delete this.ids[numericID];
};

SoTradeConnection.prototype.emit = function(evname, data, cb) {
	if (typeof data == 'function') {
		cb = data;
		data = null;
	}
	
	data = data || {};
	if (!evname)
		return console.warn('event name missing');
	data.type = evname;
	var id = ++this.id;
	data.id = evname + '--' + id;
	
	if (this.getKey() && !data.key)
		data.key = this.getKey();
	
	var now = (new Date()).getTime();
	var cacheTime = data._cache * 1000;
	if (cacheTime) {
		var qcid_obj = $.extend(true, {}, data);
		delete qcid_obj._cache;
		delete qcid_obj.id;
		var qcid = JSON.stringify(qcid_obj);
		var entry = this.qCache[qcid];
		if (entry && (now - entry._cache_rtime) < cacheTime) {
			setTimeout((function() {
				//console.log('hit', data, qcid);
				this.responseHandler(entry);
				if (cb)
					cb(entry);
			}).bind(this), 0);
			return;
		} 
		
		$.each(Object.keys(this.qCache), (function(i, k) { if (now > this.qCache[k]._cache_ptime) delete this.qCache[k]; }).bind(this));
		
		//console.log('miss', data, qcid, Object.keys(this.qCache).length);
		delete this.qCache[qcid];
		var oldCB = cb;
		cb = (function(entry) {
			//console.log('insert', entry, qcid);
			
			var now = new Date().getTime();
			entry._cache_rtime = now;
			entry._cache_ptime = now + cacheTime;
			this.qCache[qcid] = entry;
			oldCB(entry);
		}).bind(this);
	}
	
	if (cb) {
		this.ids[id] = {
			cb: cb,
			prefill: { 
				_t_csend: new Date().getTime(),
				_reqsize: JSON.stringify(data).length
			}
		};
	}
	
	this.socket.emit('query', data);
	datalog('>', data);
};

SoTradeConnection.prototype.getKey = function() {
	var cookie = document.cookie.split(';');
	for (var i = 0; i < cookie.length; ++i) {
		var c = cookie[i].trim().split('=');
		if (c[0].toLowerCase() == 'key')
			return c[1];
	}
	return null;
};

SoTradeConnection.prototype.setKey = function(k) {
	document.cookie = 'key=' + k + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
};

SoTradeConnection.prototype.on = function(evname, cb, angularScope) {
	var index = (this.listeners[evname] = (this.listeners[evname] || [])).push(cb) - 1;
	this.socket.on(evname, cb);
	if (angularScope) {
		var this_ = this;
		angularScope.$on('$destroy', function() { delete this_.listeners[evname][index]; });
	}
};

SoTradeModel = function(connection) {
	this.conn = connection;
};

// model.ownUser.group.name
Object.defineProperty(SoTradeModel.prototype, 'model', {
	get: function() {
		
	}
});

})();