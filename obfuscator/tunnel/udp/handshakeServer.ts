import * as dgram from 'dgram';
import { Obfuscator } from '../../Obfuscator';
import { subTraffic, subClientNum, addClientNum } from '../updateDB'

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

console.log(process.env.HANDSHAKE_PORT_UDP)
const HOST_NAME =  process.env.HOST_NAME
const PORT = Number(process.env.HANDSHAKE_PORT_UDP ? process.env.HANDSHAKE_PORT_UDP : 12301); // The port on which the initial UDP server listens
const TIMEOUT_DURATION = 1200000; // Time in milliseconds after which the new UDP server shuts down if no data is received
const LOCALWG_PORT = 51820;
const LOCALWG_ADDRESS = '127.0.0.1';
const TRAFFIC_INTERVAL = 600000;


// Create a UDP server
const server = dgram.createSocket('udp4');

// Map to store the last received message timestamp for each remote address
const lastMessageTimestamps: Map<string, number> = new Map();

// Function to check if the new UDP server should shut down due to inactivity
function checkInactivityTimeout(udpID: string) {
  const lastMessageTimestamp = lastMessageTimestamps.get(udpID);
  if (lastMessageTimestamp) {
    const currentTime = Date.now();
    if (currentTime - lastMessageTimestamp >= TIMEOUT_DURATION) {
      console.log(`Shutting down UDP server for ${udpID} due to inactivity`);
      const newServer = activeServers.get(udpID);
      if (newServer) {
        let msg = "inactivity"
        server.send(msg, 0, msg.length, Number(udpID.split(":")[1]), udpID.split(":")[0], (error) => {
          if (error) {
            console.log(`Failed to send response to ${udpID}`);
          }
          else {
            console.log(`inactivity sent to ${udpID}`)
          }
        });
        subTraffic(activeUserInfo.get(udpID)?.userId, activeUserInfo.get(udpID)?.traffic)
        newServer.close();
        activeServers.delete(udpID);
        activeObfuscator.delete(udpID);
        activeUserInfo.delete(udpID);
        subClientNum(HOST_NAME)
      }
    }
  }
}

// Create a map to store active UDP servers for each remote address
interface userInfo {
  userId: string,
  traffic: number
}

const activeServers: Map<string, dgram.Socket> = new Map();
const activeObfuscator: Map<string, Obfuscator> = new Map();
const activeUserInfo: Map<string, userInfo> = new Map();
const trafficInterval = setInterval(() => {
  console.log('updating traffic for all')
  activeUserInfo.forEach((value, key) => {
    subTraffic(value.userId, value.traffic)
    value.traffic = 0
  });
}, TRAFFIC_INTERVAL);
// Handle incoming messages
server.on('message', async (message, remote) => {
  try {
    if (message.toString() === 'close') {
      subTraffic(activeUserInfo.get(`${remote.address}:${remote.port}`)?.userId, activeUserInfo.get(`${remote.address}:${remote.port}`)?.traffic)
      activeServers.get(`${remote.address}:${remote.port}`)?.close()
      activeServers.delete(`${remote.address}:${remote.port}`);
      activeObfuscator.delete(`${remote.address}:${remote.port}`);
      activeUserInfo.delete(`${remote.address}:${remote.port}`)
      subClientNum(HOST_NAME)
      return
    }
    console.log(`Received handshake data from ${remote.address}:${remote.port}`);
    if (activeServers.get(`${remote.address}:${remote.port}`)) {
      let response = activeServers.get(`${remote.address}:${remote.port}`)?.address().port
      if (response && response.toString()) {
        server.send(response.toString(), 0, response.toString().length, remote.port, remote.address, (error) => {
          if (error) {
            console.error(`Failed to send response to ${remote.address}:${remote.port}`);
          } else {
            console.log(`Response sent to ${remote.address}:${remote.port}`);
          }
        });
      }
      return
    }
    // let cStat = await clientStatOperation(0)
    // if (cStat.current >= cStat.max) {
    //   let msg = "server_full"
    //   server.send(msg, 0, msg.length, remote.port, remote.address, (error) => {
    //     if (error) {
    //       console.error(`Failed to send response to ${remote.address}:${remote.port}`);
    //     } else {
    //       console.log(`server_full sent to ${remote.address}:${remote.port}`);
    //     }
    //   });
    //   return
    // }
    // Parse the incoming message as JSON
    const handshakeData = JSON.parse(message.toString());
    console.log("userId: " + handshakeData.userId)
    // Perform initialization work with the received data
    // Create an instance of the Obfuscator class
    const obfuscator = new Obfuscator(
      handshakeData.key,
      handshakeData.obfuscationLayer,
      handshakeData.randomPadding,
      handshakeData.fnInitor
    );
    // Add the new server to the active servers map
    activeObfuscator.set(`${remote.address}:${remote.port}`, obfuscator);
    activeUserInfo.set(`${remote.address}:${remote.port}`, { userId: handshakeData.userId, traffic: 0 })
    // Create a new UDP server
    const newServer = dgram.createSocket('udp4');

    // Add the new server to the active servers map
    activeServers.set(`${remote.address}:${remote.port}`, newServer);
    addClientNum(HOST_NAME)
    lastMessageTimestamps.set(`${remote.address}:${remote.port}`, Date.now());
    // Handle messages on the new server
    let newPort: number
    let newAddr: string
    newServer.on('message', (newMessage, newRemote) => {
      if (newRemote.address == LOCALWG_ADDRESS) {
        const data = activeObfuscator.get(`${remote.address}:${remote.port}`)?.obfuscation(newMessage)
        if (data) {
          newServer.send(data, 0, data.length, newPort, newAddr, (error) => {
            if (error) {
              console.error(`Failed to send response to ${remote.address}:${remote.port}`);
            } else {
              //console.log(`Data sent to ${remote.address}:${remote.port}`);
            }
          });
          let userInfo = activeUserInfo.get(`${remote.address}:${remote.port}`);
          if (userInfo) {
            userInfo.traffic += data.length;
          }
        }
      }
      else {
        newPort = newRemote.port
        newAddr = newRemote.address
        const isHeartbeat = newMessage.length === 1 && newMessage[0] === 0x01;
        // Update the last received message timestamp for the remote address
        lastMessageTimestamps.set(`${remote.address}:${remote.port}`, Date.now());
        if (!isHeartbeat) {
          //console.log("obfuscated recieved: " + new Uint8Array(newMessage) + "\n")
          const data = activeObfuscator.get(`${remote.address}:${remote.port}`)?.deobfuscation(newMessage)
          //console.log("deobfuscated recieved: " + data)
          if (data) {
            newServer.send(data, 0, data.length, LOCALWG_PORT, LOCALWG_ADDRESS, (error) => {
              if (error) {
                console.error(`Failed to send response to ${LOCALWG_ADDRESS}:${LOCALWG_PORT}`);
              } else {
                //console.log(`Data sent to ${LOCALWG_ADDRESS}:${LOCALWG_PORT}`);
              }
            });
          }
        }
      }
      // ...
    });

    // Bind the new server to a random available port
    newServer.bind(() => {
      const newPort = newServer.address().port;
      console.log(`New UDP server listening on port ${newPort}`);

      // Send the new port back to the remote client
      const response = Buffer.from(String(newPort));
      server.send(response, 0, response.length, remote.port, remote.address, (error) => {
        if (error) {
          console.error(`Failed to send response to ${remote.address}:${remote.port}`);
        } else {
          console.log(`Response sent to ${remote.address}:${remote.port}`);
        }
      });
    });

    // Set a timer to check inactivity timeout
    const inactivityTimer = setInterval(() => {
      checkInactivityTimeout(`${remote.address}:${remote.port}`);
    }, TIMEOUT_DURATION);

    // Cleanup the timer when the new server is closed
    newServer.on('close', () => {
      clearInterval(inactivityTimer);
      //clientStatOperation(-1)
    });
    //clientStatOperation(1)
  }
  catch (e) {
    console.log('server error: ' + e)
  }
});

// Start the server
server.bind(PORT, () => {
  console.log(`UDP server listening on port ${PORT}`);
});
