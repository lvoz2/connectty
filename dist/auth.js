function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import argon2 from "argon2";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import JWT from "jsonwebtoken";
import { nanoid } from "nanoid";
import validator from "validator";
var db;
_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
  return _regeneratorRuntime().wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return open({
          filename: "./" + process.env.DB_NAME,
          driver: sqlite3.Database,
          mode: sqlite3.OPEN_READWRITE
        });
      case 2:
        db = _context.sent;
      case 3:
      case "end":
        return _context.stop();
    }
  }, _callee);
}))();
function isUniqueUsername(_x) {
  return _isUniqueUsername.apply(this, arguments);
}
function _isUniqueUsername() {
  _isUniqueUsername = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(username) {
    var numUsers, result;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return queryDB(db, "SELECT username FROM users WHERE username = ?;", [username]);
        case 3:
          result = _context5.sent;
          if (result) {
            numUsers = result.length;
          } else {
            console.log("Could not verify username uniqueness: query returned undefined");
          }
          _context5.next = 10;
          break;
        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          throw _context5.t0;
        case 10:
          _context5.prev = 10;
          return _context5.finish(10);
        case 12:
          if (!numUsers) {
            _context5.next = 14;
            break;
          }
          return _context5.abrupt("return", numUsers);
        case 14:
          throw new TypeError("Result of SQL Query was not an Array");
        case 15:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 7, 10, 12]]);
  }));
  return _isUniqueUsername.apply(this, arguments);
}
function queryDB(_x2, _x3, _x4) {
  return _queryDB.apply(this, arguments);
}
function _queryDB() {
  _queryDB = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(db, query, params) {
    var stmt, result;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          if (!db) {
            _context6.next = 14;
            break;
          }
          _context6.next = 3;
          return db.prepare(query);
        case 3:
          stmt = _context6.sent;
          stmt.bind(params);
          _context6.next = 7;
          return stmt.all();
        case 7:
          result = _context6.sent;
          if (!Array.isArray(result)) {
            _context6.next = 10;
            break;
          }
          return _context6.abrupt("return", result);
        case 10:
          console.log("Error - Malformed Response");
          return _context6.abrupt("return", []);
        case 14:
          console.log("DB not ready");
          return _context6.abrupt("return", []);
        case 16:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _queryDB.apply(this, arguments);
}
function createUser(_x5, _x6, _x7) {
  return _createUser.apply(this, arguments);
}
function _createUser() {
  _createUser = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(username, password, maxPermsLevel) {
    var status, uid, hash, insert, users;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          status = "";
          uid = uuidv4();
          _context7.prev = 2;
          _context7.next = 5;
          return isUniqueUsername(username);
        case 5:
          _context7.t0 = _context7.sent;
          if (!(_context7.t0 == 0)) {
            _context7.next = 19;
            break;
          }
          _context7.next = 9;
          return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 64 * 1024,
            timeCost: 2,
            parallelism: 1
          });
        case 9:
          hash = _context7.sent;
          _context7.next = 12;
          return queryDB(db, "INSERT INTO users (id, username, password, max_perms) VALUES (?, ?, ?, ?);", [uid, username, hash, maxPermsLevel]);
        case 12:
          insert = _context7.sent;
          _context7.next = 15;
          return queryDB(db, "SELECT username FROM users WHERE username = ?;", [username]);
        case 15:
          users = _context7.sent;
          status = users.length == 1 ? "Success" : "";
          _context7.next = 20;
          break;
        case 19:
          status = "Username already in use";
        case 20:
          _context7.next = 25;
          break;
        case 22:
          _context7.prev = 22;
          _context7.t1 = _context7["catch"](2);
          throw _context7.t1;
        case 25:
          _context7.prev = 25;
          return _context7.finish(25);
        case 27:
          return _context7.abrupt("return", [status, uid]);
        case 28:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[2, 22, 25, 27]]);
  }));
  return _createUser.apply(this, arguments);
}
function validateCredentials(_x8, _x9) {
  return _validateCredentials.apply(this, arguments);
}
function _validateCredentials() {
  _validateCredentials = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(username, password) {
    var status, uid, permsLevel, result, password_hash;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          status = "Failed";
          permsLevel = "none";
          _context8.prev = 2;
          _context8.next = 5;
          return queryDB(db, "SELECT id, username, password, max_perms FROM users WHERE username = ?;", [username]);
        case 5:
          result = _context8.sent;
          if (!Array.isArray(result)) {
            _context8.next = 18;
            break;
          }
          if (!(result.length == 1)) {
            _context8.next = 18;
            break;
          }
          password_hash = result[0]["password"];
          _context8.next = 11;
          return argon2.verify(password_hash, password);
        case 11:
          if (!_context8.sent) {
            _context8.next = 15;
            break;
          }
          _context8.t0 = "Correct credentials";
          _context8.next = 16;
          break;
        case 15:
          _context8.t0 = "Incorrect credentials";
        case 16:
          status = _context8.t0;
          if (status === "Correct credentials") {
            permsLevel = result[0]["max_perms"];
            uid = result[0]["id"];
          }
        case 18:
          _context8.next = 23;
          break;
        case 20:
          _context8.prev = 20;
          _context8.t1 = _context8["catch"](2);
          throw _context8.t1;
        case 23:
          _context8.prev = 23;
          return _context8.finish(23);
        case 25:
          if (!uid) {
            _context8.next = 27;
            break;
          }
          return _context8.abrupt("return", [status, uid, permsLevel]);
        case 27:
          return _context8.abrupt("return", [status, permsLevel]);
        case 28:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[2, 20, 23, 25]]);
  }));
  return _validateCredentials.apply(this, arguments);
}
export function createAuthRoute(cookieOptions) {
  return /*#__PURE__*/function () {
    var _authenticate = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
      var username, password, statusText, validated, status, permsLevel, unique, jwt;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            username = req.body.username;
            password = req.body.password;
            statusText = "Failed";
            validated = true;
            permsLevel = "none";
            if (!validated) {
              _context2.next = 13;
              break;
            }
            _context2.next = 8;
            return isUniqueUsername(username);
          case 8:
            unique = _context2.sent;
            if (!(unique == 1)) {
              _context2.next = 13;
              break;
            }
            _context2.next = 12;
            return validateCredentials(username, password);
          case 12:
            status = _context2.sent;
          case 13:
            if (status) {
              if (status[0]) {
                statusText = "Success";
                permsLevel = status[status.length - 1];
              }
            }
            _context2.next = 16;
            return createAuthJWT(permsLevel);
          case 16:
            jwt = _context2.sent;
            res.cookie(process.env.COOKIE_NAME, jwt, cookieOptions);
            res.json({
              "status": statusText
            });
          case 19:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function authenticate(_x10, _x11) {
      return _authenticate.apply(this, arguments);
    }
    return authenticate;
  }();
}
function checkAccess(_x12, _x13, _x14) {
  return _checkAccess.apply(this, arguments);
}
function _checkAccess() {
  _checkAccess = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(jwt, resource, options) {
    var JWTKey, isJWT, payload, payloadSection, canAccess, extraInfo, _payload, _payloadSection;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          JWTKey = process.env.JWT_KEY;
          _context9.prev = 1;
          isJWT = validator.isJWT(jwt);
          if (isJWT) {
            _context9.next = 5;
            break;
          }
          return _context9.abrupt("return", false);
        case 5:
          _context9.next = 11;
          break;
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](1);
          console.log(_context9.t0);
          return _context9.abrupt("return", false);
        case 11:
          _context9.prev = 11;
          payloadSection = JWT.verify(jwt, JWTKey, options);
          if (typeof payloadSection === "string") {
            payload = JSON.parse(payloadSection);
          } else {
            payload = payloadSection;
          }
          if (!("lvl" in payload)) {
            _context9.next = 21;
            break;
          }
          canAccess = false;
          if (options) {
            if ("endpoints" in options && options.endpoints != undefined) {
              canAccess = options.endpoints[payload.lvl].includes(resource);
            }
          }
          if (!canAccess && "urls" in payload && Array.isArray(payload.urls)) {
            canAccess = validateURLArray(payload.urls) && payload.urls.includes(resource);
          }
          return _context9.abrupt("return", canAccess);
        case 21:
          return _context9.abrupt("return", false);
        case 22:
          _context9.next = 44;
          break;
        case 24:
          _context9.prev = 24;
          _context9.t1 = _context9["catch"](11);
          if (!(_context9.t1 instanceof JWT.JsonWebTokenError)) {
            _context9.next = 42;
            break;
          }
          if (!(_context9.t1 instanceof JWT.TokenExpiredError)) {
            _context9.next = 37;
            break;
          }
          _payloadSection = JWT.decode(jwt, options);
          if (!(_payloadSection != null)) {
            _context9.next = 34;
            break;
          }
          if (typeof _payloadSection === "string") {
            _payload = JSON.parse(_payloadSection);
          } else {
            _payload = _payloadSection;
          }
          if (!("lvl" in _payload)) {
            _context9.next = 34;
            break;
          }
          _context9.next = 34;
          return queryDB(db, "DELETE FROM jwt WHERE jti = ?;", [_payload.jti]);
        case 34:
          return _context9.abrupt("return", false);
        case 37:
          if (_context9.t1 instanceof JWT.NotBeforeError) {
            extraInfo = ". Date: " + _context9.t1.date;
          }
        case 38:
          console.log(_context9.t1.name + ": " + _context9.t1.message + (extraInfo != undefined ? extraInfo : ""));
          return _context9.abrupt("return", false);
        case 42:
          throw _context9.t1;
        case 44:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[1, 7], [11, 24]]);
  }));
  return _checkAccess.apply(this, arguments);
}
function createJWT(payload, options) {
  var JWTKey = process.env.JWT_KEY;
  var token = JWT.sign(payload, JWTKey, options);
  return token;
}
function createAuthJWT(_x15, _x16) {
  return _createAuthJWT.apply(this, arguments);
}
function _createAuthJWT() {
  _createAuthJWT = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(lvl, urls) {
    var jti, payload, jwt, numJWTs;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          jti = nanoid();
          payload = {
            lvl: lvl
          };
          if (Array.isArray(urls)) {
            payload.urls = urls;
          }
          jwt = createJWT(payload, {
            jwtid: jti,
            expiresIn: "3h",
            mutatePayload: true
          });
          if (!(payload.iat == undefined)) {
            _context10.next = 6;
            break;
          }
          throw new TypeError("Error: JWT iat not set in payload");
        case 6:
          _context10.next = 8;
          return queryDB(db, "INSERT INTO jwt (jti, last_used) VALUES (?, ?);", [jti, payload.iat.toString()]);
        case 8:
          _context10.next = 10;
          return queryDB(db, "SELECT * FROM jwt WHERE jti = ?;", [jti]);
        case 10:
          numJWTs = _context10.sent.length;
          if (!(numJWTs === 1)) {
            _context10.next = 13;
            break;
          }
          return _context10.abrupt("return", jwt);
        case 13:
          throw new Error("NanoID Collision Found");
        case 14:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return _createAuthJWT.apply(this, arguments);
}
function validateURLArray(urls) {
  return urls.reduce(function (acc, e) {
    return acc && validator.isURL(e, {
      protocols: ["http", "https"],
      require_tld: false,
      require_host: false,
      allow_underscores: true,
      allow_protocol_relative_urls: true,
      allow_query_components: false
    });
  }, true);
}
export function createRegisterRoute(cookieOptions) {
  return /*#__PURE__*/function () {
    var _register = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
      var username, password, permsLevel, urls, validated, status, sqlStatus;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            username = req.body.username;
            password = req.body.password;
            permsLevel = req.body.permsLevel || "basic";
            urls = Array.isArray(req.body.urls) && validateURLArray(req.body.urls) ? req.body.urls : null;
            validated = urls != undefined;
            status = "Failed"; // validate
            if (!validated) {
              _context3.next = 15;
              break;
            }
            _context3.next = 9;
            return isUniqueUsername(username);
          case 9:
            _context3.t0 = _context3.sent;
            if (!(_context3.t0 == 0)) {
              _context3.next = 15;
              break;
            }
            _context3.next = 13;
            return createUser(username, password, permsLevel);
          case 13:
            sqlStatus = _context3.sent;
            status = sqlStatus[0] ? "Successful Creation of User" : "Failed";
          case 15:
            res.json({
              "status": status
            });
            res.cookie(process.env.COOKIE_NAME, createAuthJWT(permsLevel, urls), cookieOptions);
          case 17:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    function register(_x17, _x18) {
      return _register.apply(this, arguments);
    }
    return register;
  }();
}
export function createCheckAuthMiddleware(endpoints) {
  return /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res, next) {
      var jwt;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            jwt = req.signedCookies[process.env.COOKIE_NAME];
            if (!endpoints.none.includes(req.path)) {
              _context4.next = 5;
              break;
            }
            next();
            _context4.next = 15;
            break;
          case 5:
            _context4.t0 = jwt !== false;
            if (!_context4.t0) {
              _context4.next = 10;
              break;
            }
            _context4.next = 9;
            return checkAccess(jwt, req.path, {
              "endpoints": endpoints
            });
          case 9:
            _context4.t0 = _context4.sent;
          case 10:
            if (!_context4.t0) {
              _context4.next = 14;
              break;
            }
            next();
            _context4.next = 15;
            break;
          case 14:
            next("route");
          case 15:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return function (_x19, _x20, _x21) {
      return _ref2.apply(this, arguments);
    };
  }();
}
export default {
  createAuthRoute: createAuthRoute,
  createCheckAuthMiddleware: createCheckAuthMiddleware,
  createRegisterRoute: createRegisterRoute
};