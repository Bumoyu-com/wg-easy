"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var dgram = require("dgram");
var Obfuscator_1 = require("../../Obfuscator");
console.log(process.env.HANDSHAKE_PORT_TCP);
var PORT = Number(process.env.HANDSHAKE_PORT_TCP ? process.env.HANDSHAKE_PORT_TCP : 8080); // The port on which the initial UDP server listens
var TIMEOUT_DURATION = 1200000; // Time in milliseconds after which the new UDP server shuts down if no data is received
var LOCALWG_PORT = 51820;
var LOCALWG_ADDRESS = '0.0.0.0';
var MESSAGE_TYPE_HANDSHAKE = 0x01;
var MESSAGE_TYPE_HEARTBEAT = 0x02;
var MESSAGE_TYPE_WG = 0x03;
var MESSAGE_TYPE_INACTIVITY = 0x04;
var constantValue = 0x25748935; // Replace this with your desired constant value
var separatorBuffer = Buffer.alloc(4);
// Write the constant value into the Buffer
separatorBuffer.writeUInt32LE(constantValue, 0);
function sendBinaryInfoMessage(client, message) {
    var headerBuffer = Buffer.alloc(1);
    headerBuffer.writeUInt8(MESSAGE_TYPE_INACTIVITY);
    var messageBuffer = Buffer.from(message);
    var binaryMessage = Buffer.concat([headerBuffer, messageBuffer, separatorBuffer]);
    client.write(binaryMessage);
}
function sendBinaryHandshake(client) {
    var headerBuffer = Buffer.alloc(1);
    headerBuffer.writeUInt8(MESSAGE_TYPE_HANDSHAKE);
    var binaryMessage = Buffer.concat([headerBuffer, separatorBuffer]);
    client.write(binaryMessage);
}
function sendBinaryHeartbeat(client) {
    var headerBuffer = Buffer.alloc(1);
    headerBuffer.writeUInt8(MESSAGE_TYPE_HEARTBEAT);
    var binaryMessage = Buffer.concat([headerBuffer, separatorBuffer]);
    client.write(binaryMessage);
}
// Function to check if the new UDP server should shut down due to inactivity
function checkInactivityTimeout(clientID, client) {
    var lastMessageTimestamp = lastMessageTimestamps.get(clientID);
    if (lastMessageTimestamp) {
        var currentTime = Date.now();
        if (currentTime - lastMessageTimestamp >= TIMEOUT_DURATION) {
            console.log("Shutting down UDP server for ".concat(clientID, " due to inactivity"));
            var newServer = activeServers.get(clientID);
            if (newServer) {
                sendBinaryInfoMessage(client, "inactivity");
                client.destroy();
                newServer.close();
                activeServers.delete(clientID);
                activeObfuscator.delete(clientID);
                activeClient.delete(clientID);
                lastMessageTimestamps.delete(clientID);
            }
        }
    }
}
// Create a map to store active UDP servers for each remote address
var activeServers = new Map();
var activeObfuscator = new Map();
var activeClient = new Map();
var activeMsgQueue = new Map();
// Map to store the last received message timestamp for each remote address
var lastMessageTimestamps = new Map();
var server = net.createServer();
server.listen(PORT, function () {
    console.log('TCP server listening on port', PORT);
});
server.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var remote, client, inactivityTimer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                remote = { address: socket.remoteAddress, port: socket.remotePort };
                return [4 /*yield*/, activeClient.set("".concat(remote.address, ":").concat(remote.port), socket)];
            case 1:
                _a.sent();
                return [4 /*yield*/, activeMsgQueue.set("".concat(remote.address, ":").concat(remote.port), null)];
            case 2:
                _a.sent();
                client = activeClient.get("".concat(remote.address, ":").concat(remote.port));
                inactivityTimer = setInterval(function () {
                    checkInactivityTimeout("".concat(remote.address, ":").concat(remote.port), client);
                }, TIMEOUT_DURATION);
                client.on('data', function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var msgQueue, separatorIndex, messageBuffer, messageType, messageBody, _a, handshakeData, obfuscator, newServer, typedArray, deobfuscatedData;
                    var _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                console.log("Received msg from ".concat(remote.address, ":").concat(remote.port));
                                msgQueue = activeMsgQueue.get("".concat(remote.address, ":").concat(remote.port));
                                if (msgQueue === undefined) {
                                    return [2 /*return*/, -1];
                                }
                                if (msgQueue === null) {
                                    msgQueue = Buffer.from(data);
                                }
                                else {
                                    msgQueue = Buffer.concat([msgQueue, Buffer.from(data)]);
                                }
                                _d.label = 1;
                            case 1:
                                if (!true) return [3 /*break*/, 11];
                                separatorIndex = msgQueue.indexOf(separatorBuffer);
                                if (separatorIndex === -1) {
                                    // If no separator is found, break and wait for more data
                                    return [3 /*break*/, 11];
                                }
                                messageBuffer = msgQueue.subarray(0, separatorIndex);
                                // Remove the processed message and separator from msgQueue
                                msgQueue = msgQueue.subarray(separatorIndex + 4);
                                messageType = messageBuffer.readUInt8(0);
                                messageBody = messageBuffer.subarray(1);
                                lastMessageTimestamps.set("".concat(remote.address, ":").concat(remote.port), Date.now());
                                _a = messageType;
                                switch (_a) {
                                    case MESSAGE_TYPE_HEARTBEAT: return [3 /*break*/, 2];
                                    case MESSAGE_TYPE_HANDSHAKE: return [3 /*break*/, 3];
                                    case MESSAGE_TYPE_WG: return [3 /*break*/, 8];
                                }
                                return [3 /*break*/, 9];
                            case 2:
                                sendBinaryHeartbeat(client);
                                return [3 /*break*/, 10];
                            case 3:
                                console.log("Handshake from ".concat(remote.address, ":").concat(remote.port, ": ").concat(messageBody.toString()));
                                handshakeData = JSON.parse(messageBody.toString());
                                return [4 /*yield*/, new Obfuscator_1.Obfuscator(handshakeData.key, handshakeData.obfuscationLayer, handshakeData.randomPadding, handshakeData.fnInitor)];
                            case 4:
                                obfuscator = _d.sent();
                                // Store the obfuscator in the activeObfuscator map
                                return [4 /*yield*/, activeObfuscator.set("".concat(remote.address, ":").concat(remote.port), obfuscator)];
                            case 5:
                                // Store the obfuscator in the activeObfuscator map
                                _d.sent();
                                return [4 /*yield*/, dgram.createSocket('udp4')];
                            case 6:
                                newServer = _d.sent();
                                return [4 /*yield*/, activeServers.set("".concat(remote.address, ":").concat(remote.port), newServer)];
                            case 7:
                                _d.sent();
                                // Handle the new UDP server's events and logic here as needed
                                // Respond to the handshake with a binary message if necessary
                                newServer.on('message', function (newMessage, newRemote) {
                                    var _a;
                                    if (newRemote.port == LOCALWG_PORT) {
                                        var data_1 = (_a = activeObfuscator.get("".concat(remote.address, ":").concat(remote.port))) === null || _a === void 0 ? void 0 : _a.obfuscation(newMessage);
                                        if (data_1) {
                                            var headerBuffer = Buffer.alloc(1);
                                            headerBuffer.writeUInt8(MESSAGE_TYPE_WG);
                                            var messageBuffer_1 = Buffer.from(data_1);
                                            var binaryMessage = Buffer.concat([headerBuffer, messageBuffer_1, separatorBuffer]);
                                            activeClient.get("".concat(remote.address, ":").concat(remote.port)).write(binaryMessage);
                                        }
                                    }
                                    else {
                                        console.log("Unknow data recieved from ".concat(newRemote.address, ":").concat(newRemote.port));
                                    }
                                    // ...
                                });
                                // Cleanup the timer when the new server is closed
                                newServer.on('close', function () {
                                    activeServers.delete("".concat(remote.address, ":").concat(remote.port));
                                    activeObfuscator.delete("".concat(remote.address, ":").concat(remote.port));
                                    activeClient.delete("".concat(remote.address, ":").concat(remote.port));
                                    lastMessageTimestamps.delete("".concat(remote.address, ":").concat(remote.port));
                                    clearInterval(inactivityTimer);
                                    client.destroy();
                                });
                                // Bind the new UDP server
                                newServer.bind();
                                sendBinaryHandshake(client);
                                return [3 /*break*/, 10];
                            case 8:
                                typedArray = new Uint8Array(messageBody);
                                deobfuscatedData = (_b = activeObfuscator.get("".concat(remote.address, ":").concat(remote.port))) === null || _b === void 0 ? void 0 : _b.deobfuscation(typedArray.buffer);
                                if (deobfuscatedData) {
                                    (_c = activeServers.get("".concat(remote.address, ":").concat(remote.port))) === null || _c === void 0 ? void 0 : _c.send(deobfuscatedData, 0, deobfuscatedData.length, LOCALWG_PORT, LOCALWG_ADDRESS, function (error) {
                                        if (error) {
                                            console.error("Failed to send response to ".concat(LOCALWG_ADDRESS, ":").concat(LOCALWG_PORT));
                                        }
                                        else {
                                            console.log("Data sent to ".concat(LOCALWG_ADDRESS, ":").concat(LOCALWG_PORT));
                                        }
                                    });
                                }
                                return [3 /*break*/, 10];
                            case 9:
                                console.log("Unknow msg recieved from ".concat(remote.address, ":").concat(remote.port));
                                _d.label = 10;
                            case 10: return [3 /*break*/, 1];
                            case 11: return [2 /*return*/];
                        }
                    });
                }); });
                client.on('close', function () {
                    console.log('closing...');
                    var udpServer = activeServers.get("".concat(remote.address, ":").concat(remote.port));
                    if (udpServer) {
                        udpServer.close();
                    }
                    activeServers.delete("".concat(remote.address, ":").concat(remote.port));
                    activeObfuscator.delete("".concat(remote.address, ":").concat(remote.port));
                    activeClient.delete("".concat(remote.address, ":").concat(remote.port));
                    lastMessageTimestamps.delete("".concat(remote.address, ":").concat(remote.port));
                    clearInterval(inactivityTimer);
                    //clientStatOperation(-1)
                });
                client.on('error', function (error) {
                    console.error('Socket error:', error);
                    // Handle the error gracefully, e.g., close the socket
                    client.destroy(); // Close the socket to prevent crashing
                });
                return [2 /*return*/];
        }
    });
}); });
