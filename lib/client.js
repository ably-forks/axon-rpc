
/**
 * Expose `Client`.
 */

module.exports = Client;

/**
 * Initialize an rpc client with `sock`.
 *
 * @param {Socket} sock
 * @api public
 */

function Client(sock) {
  if (typeof sock.format === 'function') sock.format('json');
  this.sock = sock;
}

/**
 * Invoke method `name` with args and invoke the
 * tailing callback function.
 *
 * @param {String} name
 * @param {Mixed} ...
 * @param {Function} fn
 * @api public
 */

Client.prototype.call = function(name){
  var args = [].slice.call(arguments, 1, -1);
  var fn = arguments[arguments.length - 1];
  var msg = [ 'call', name ].concat(args, onCallComplete.bind(null, fn));
  var sock = this.sock;
  sock.send.apply(sock, msg);
};

function onCallComplete(fn, msg){
  var type = msg.shift();
  if (type == 'error') {
    var err = new Error(msg[0]);
    err.stack = msg[1] || err.stack;
    fn(err);
  } else {
    msg.unshift(null);
    fn.apply(null, msg);
  }
}

/**
 * Fetch the methods exposed and invoke `fn(err, methods)`.
 *
 * @param {Function} fn
 * @api public
 */

Client.prototype.methods = function(fn){
  var sock = this.sock;
  sock.send.apply(sock, ['methods', onMethodsComplete.bind(null, fn)]);
};

function onMethodsComplete(fn, msg) {
  var type = msg.shift();
  fn(null, msg);
}
