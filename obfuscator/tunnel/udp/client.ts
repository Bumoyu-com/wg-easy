import * as dgram from 'dgram';
import { Obfuscator } from '../../Obfuscator';
import { fnInitor } from '../../fnInitor';

let client
let handshakeInterval: NodeJS.Timeout; // Declare handshakeInterval variable
let heartBeatInterval: NodeJS.Timeout; // Declare heartBeatInterval variable
let clientOpenStatus = false
let HANDSHAKE_SERVER_ADDRESS
let HANDSHAKE_SERVER_PORT

export function startUdpClient(remoteAddress: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    HANDSHAKE_SERVER_ADDRESS = remoteAddress; // Handshake server address
    HANDSHAKE_SERVER_PORT = 12301; // Handshake server port
    const LOCALWG_ADDRESS = '127.0.0.1';
    const LOCALWG_PORT = 51820;
    const MAX_RETRIES = 5
    const HEARTBEAT_INTERVAL = 120000
    const heartbeatData = Buffer.from([0x01]);

    const handshakeData = {
      key: Math.floor(Math.random() * 256),
      obfuscationLayer: 3,
      randomPadding: 8,
      fnInitor: fnInitor()
    };

    // Create an instance of the Obfuscator class
    const obfuscator = new Obfuscator(
      handshakeData.key,
      handshakeData.obfuscationLayer,
      handshakeData.randomPadding,
      handshakeData.fnInitor
    );


    if (handshakeInterval) {
      clearInterval(handshakeInterval);
    }
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval);
    }
    if (client && clientOpenStatus) {
      client.send('close', 0, 'close'.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
        if (error) {
          console.error('Failed to send handshake data:', error);
        } else {
          console.log('Handshake data sent to the handshake server');
        }
      });
      client.close()
    }
    // Create a UDP client socket
    client = dgram.createSocket('udp4');
    let clientPort: number
    let clientRetry = 0

    let newServerPort: number; // Store the port of the new server

    // Function to send handshake data to the handshake server
    function sendHandshakeData() {
      const message = Buffer.from(JSON.stringify(handshakeData));

      // Send the handshake data to the handshake server
      client.send(message, 0, message.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
        if (error) {
          console.error('Failed to send handshake data:', error);
        } else {
          console.log('Handshake data sent to the handshake server');
        }
      });
    }

    // Handle incoming messages from the handshake server and the new UDP server
    client.on('message', (message, remote) => {
      console.log(`Received data from ${remote.address}:${remote.port}`);
      if (remote.port === HANDSHAKE_SERVER_PORT) {
        // Message received from the handshake server
        if (message.toString() === "inactivity") {
          // Stop sending handshake data and start communication with the new UDP server
          if (handshakeInterval) {
            clearInterval(handshakeInterval);
          }
          if (heartBeatInterval) {
            clearInterval(heartBeatInterval);
          }
          client.send('close', 0, 'close'.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
            if (error) {
              console.error('Failed to send handshake data:', error);
            } else {
              console.log('Handshake data sent to the handshake server');
            }
          });
          client.close()
        }
        else if (message.toString() === "server_full") {
          // Stop sending handshake data and start communication with the new UDP server
          if (handshakeInterval) {
            clearInterval(handshakeInterval);
          }
          if (heartBeatInterval) {
            clearInterval(heartBeatInterval);
          }
          client.send('close', 0, 'close'.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
            if (error) {
              console.error('Failed to send handshake data:', error);
            } else {
              console.log('Handshake data sent to the handshake server');
            }
          });
          client.close()
          reject("server_full")
        }
        else if (!isNaN(parseInt(message.toString(), 10))) {
          newServerPort = parseInt(message.toString(), 10);
          console.log(`Received new server port from handshake server: ${newServerPort}`);
          // Stop sending handshake data and start communication with the new UDP server
          if (handshakeInterval) {
            clearInterval(handshakeInterval);
          }
          heartBeatInterval = setInterval(() => {
            client.send(heartbeatData, 0, heartbeatData.length, newServerPort, HANDSHAKE_SERVER_ADDRESS, (error) => {
              if (error) {
                console.error('Failed to send data to new server:', error);
              } else {
                console.log('heartBeat sent to new server');
              }
            })
          }, HEARTBEAT_INTERVAL)
          // Resolve the promise with the client port once everything is set up
          resolve(clientPort);
        }
        else {
          console.error('Invalid new server port received:', message.toString());
        }

      } else if (remote.port === LOCALWG_PORT) {
        sendToNewServer(message);
      } else if (remote.port === newServerPort) {
        sendToLocalWG(message);
      } else {
        // Message received from the new UDP server
        console.log(`Received data from unknown server: ${message.toString()}`);

        // Process the received data from the new server
        // ...
      }
    });

    // Function to send data to the new UDP server
    function sendToNewServer(message: ArrayBuffer) {
      if (newServerPort) {
        const obfuscatedData = obfuscator.obfuscation(message);
        client.send(obfuscatedData, 0, obfuscatedData.length, newServerPort, HANDSHAKE_SERVER_ADDRESS, (error) => {
          if (error) {
            console.error('Failed to send data to new server:', error);
          } else {
            console.log('Data sent to new server');
          }
        });
      } else {
        console.error('New server port is not available yet');
      }
    }

    // Function to send data to the new UDP server
    function sendToLocalWG(message: ArrayBuffer) {
      const deobfuscatedData = obfuscator.deobfuscation(message);
      client.send(deobfuscatedData, 0, deobfuscatedData.length, LOCALWG_PORT, LOCALWG_ADDRESS, (error) => {
        if (error) {
          console.error('Failed to send data to local-wg server:', error);
        } else {
          console.log('Data sent to local-wg server');
        }
      });
    }

    client.on('listening', () => {
      clientOpenStatus = true
    })
    client.on('close', () => {
      clientOpenStatus = false
    })
    // Bind the socket to a specific port
    client.bind(() => {
      clientPort = client.address().port;
      console.log(`Client socket bound to port ${clientPort}`);

      // Send handshake data initially
      sendHandshakeData();

      // Set an interval to send handshake data periodically
      handshakeInterval = setInterval(() => {
        sendHandshakeData();
        clientRetry++
        if (clientRetry >= MAX_RETRIES) {
          clearInterval(handshakeInterval);
          client.send('close', 0, 'close'.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
            if (error) {
              console.error('Failed to send handshake data:', error);
            } else {
              console.log('Handshake data sent to the handshake server');
            }
          });
          client.close();
          reject("max_retries")
        }
      }, 5000);
    });
  });
}


export function stopUdpClient(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Stop sending handshake data and heartbeats
    if (handshakeInterval) {
      clearInterval(handshakeInterval);
    }
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval);
    }

    if (client && clientOpenStatus) {
      client.send('close', 0, 'close'.length, HANDSHAKE_SERVER_PORT, HANDSHAKE_SERVER_ADDRESS, (error) => {
        if (error) {
          console.error('Failed to send handshake data:', error);
        } else {
          console.log('Handshake data sent to the handshake server');
        }
      });
      // Close the UDP socket
      client.close(() => {
        // Unreference the socket to allow the application to exit even if the socket is still open
        client.unref();

        // Resolve the promise to indicate that the socket has been closed and destroyed
        resolve();
      });
    } else {
      // If the client variable is not defined, assume that the socket is already closed
      resolve();
    }
  });
}

export function udpClientStatus(): boolean {
  return clientOpenStatus
}

//startUdpClient('5.104.80.248')