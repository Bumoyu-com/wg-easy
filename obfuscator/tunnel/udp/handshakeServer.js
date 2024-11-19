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
var dgram = require("dgram");
var Obfuscator_1 = require("../../Obfuscator");
// //function to record concurrency client and max client
// let clientStatOperation = function(ins:number) {
//   let rawdata = fs.readFileSync('../clientStat.json', { encoding: 'utf8' });
//   let clientStat = JSON.parse(rawdata);
//   clientStat.current = clientStat.current + ins;
//   if(clientStat.current < 0) {
//     clientStat.current = 0
//   }
//   fs.writeFileSync('../clientStat.json', JSON.stringify(clientStat));
//   return clientStat;
// }
console.log(process.env.HANDSHAKE_PORT_UDP);
var PORT = Number(process.env.HANDSHAKE_PORT_UDP ? process.env.HANDSHAKE_PORT_UDP : 12301); // The port on which the initial UDP server listens
var TIMEOUT_DURATION = 1200000; // Time in milliseconds after which the new UDP server shuts down if no data is received
var LOCALWG_PORT = 51820;
var LOCALWG_ADDRESS = '127.0.0.1';
// Create a UDP server
var server = dgram.createSocket('udp4');
// Map to store the last received message timestamp for each remote address
var lastMessageTimestamps = new Map();
// Function to check if the new UDP server should shut down due to inactivity
function checkInactivityTimeout(udpID) {
    var lastMessageTimestamp = lastMessageTimestamps.get(udpID);
    if (lastMessageTimestamp) {
        var currentTime = Date.now();
        if (currentTime - lastMessageTimestamp >= TIMEOUT_DURATION) {
            console.log("Shutting down UDP server for ".concat(udpID, " due to inactivity"));
            var newServer = activeServers.get(udpID);
            if (newServer) {
                var msg = "inactivity";
                server.send(msg, 0, msg.length, Number(udpID.split(":")[1]), udpID.split(":")[0], function (error) {
                    if (error) {
                        console.log("Failed to send response to ".concat(udpID));
                    }
                    else {
                        console.log("inactivity sent to ".concat(udpID));
                    }
                });
                newServer.close();
                activeServers.delete(udpID);
                activeObfuscator.delete(udpID);
            }
        }
    }
}
// Create a map to store active UDP servers for each remote address
var activeServers = new Map();
var activeObfuscator = new Map();
// Handle incoming messages
server.on('message', function (message, remote) { return __awaiter(void 0, void 0, void 0, function () {
    var response, handshakeData, obfuscator, newServer, newPort, newAddr, inactivityTimer;
    var _a, _b;
    return __generator(this, function (_c) {
        if (message.toString() === 'close') {
            (_a = activeServers.get("".concat(remote.address, ":").concat(remote.port))) === null || _a === void 0 ? void 0 : _a.close();
            activeServers.delete("".concat(remote.address, ":").concat(remote.port));
            activeObfuscator.delete("".concat(remote.address, ":").concat(remote.port));
            return [2 /*return*/];
        }
        console.log("Received handshake data from ".concat(remote.address, ":").concat(remote.port));
        if (activeServers.get("".concat(remote.address, ":").concat(remote.port))) {
            response = (_b = activeServers.get("".concat(remote.address, ":").concat(remote.port))) === null || _b === void 0 ? void 0 : _b.address().port;
            if (response && response.toString()) {
                server.send(response.toString(), 0, response.toString().length, remote.port, remote.address, function (error) {
                    if (error) {
                        console.error("Failed to send response to ".concat(remote.address, ":").concat(remote.port));
                    }
                    else {
                        console.log("Response sent to ".concat(remote.address, ":").concat(remote.port));
                    }
                });
            }
            return [2 /*return*/];
        }
        handshakeData = JSON.parse(message.toString());
        obfuscator = new Obfuscator_1.Obfuscator(handshakeData.key, handshakeData.obfuscationLayer, handshakeData.randomPadding, handshakeData.fnInitor);
        // Add the new server to the active servers map
        activeObfuscator.set("".concat(remote.address, ":").concat(remote.port), obfuscator);
        newServer = dgram.createSocket('udp4');
        // Add the new server to the active servers map
        activeServers.set("".concat(remote.address, ":").concat(remote.port), newServer);
        lastMessageTimestamps.set("".concat(remote.address, ":").concat(remote.port), Date.now());
        newServer.on('message', function (newMessage, newRemote) {
            var _a, _b;
            if (newRemote.address == LOCALWG_ADDRESS) {
                var data = (_a = activeObfuscator.get("".concat(remote.address, ":").concat(remote.port))) === null || _a === void 0 ? void 0 : _a.obfuscation(newMessage);
                if (data) {
                    newServer.send(data, 0, data.length, newPort, newAddr, function (error) {
                        if (error) {
                            console.error("Failed to send response to ".concat(remote.address, ":").concat(remote.port));
                        }
                        else {
                            console.log("Data sent to ".concat(remote.address, ":").concat(remote.port));
                        }
                    });
                }
            }
            else {
                newPort = newRemote.port;
                newAddr = newRemote.address;
                var isHeartbeat = newMessage.length === 1 && newMessage[0] === 0x01;
                // Update the last received message timestamp for the remote address
                lastMessageTimestamps.set("".concat(remote.address, ":").concat(remote.port), Date.now());
                if (!isHeartbeat) {
                    //console.log("obfuscated recieved: " + new Uint8Array(newMessage) + "\n")
                    var data = (_b = activeObfuscator.get("".concat(remote.address, ":").concat(remote.port))) === null || _b === void 0 ? void 0 : _b.deobfuscation(newMessage);
                    //console.log("deobfuscated recieved: " + data)
                    if (data) {
                        newServer.send(data, 0, data.length, LOCALWG_PORT, LOCALWG_ADDRESS, function (error) {
                            if (error) {
                                console.error("Failed to send response to ".concat(LOCALWG_ADDRESS, ":").concat(LOCALWG_PORT));
                            }
                            else {
                                console.log("Data sent to ".concat(LOCALWG_ADDRESS, ":").concat(LOCALWG_PORT));
                            }
                        });
                    }
                }
            }
            // ...
        });
        // Bind the new server to a random available port
        newServer.bind(function () {
            var newPort = newServer.address().port;
            console.log("New UDP server listening on port ".concat(newPort));
            // Send the new port back to the remote client
            var response = Buffer.from(String(newPort));
            server.send(response, 0, response.length, remote.port, remote.address, function (error) {
                if (error) {
                    console.error("Failed to send response to ".concat(remote.address, ":").concat(remote.port));
                }
                else {
                    console.log("Response sent to ".concat(remote.address, ":").concat(remote.port));
                }
            });
        });
        inactivityTimer = setInterval(function () {
            checkInactivityTimeout("".concat(remote.address, ":").concat(remote.port));
        }, TIMEOUT_DURATION);
        // Cleanup the timer when the new server is closed
        newServer.on('close', function () {
            clearInterval(inactivityTimer);
            //clientStatOperation(-1)
        });
        return [2 /*return*/];
    });
}); });
// Start the server
server.bind(PORT, function () {
    console.log("UDP server listening on port ".concat(PORT));
});
