
import axios, { AxiosResponse } from 'axios';
const subTrafficUrl = process.env.SUB_TRAFFIC_URL

export const subTraffic = async (userId: string | undefined, traffic: number | undefined) => {
    if (userId && traffic) {
        await axios({
            method: 'post',
            url: subTrafficUrl,
            data: {
                id: userId,
                traffic: traffic
            }
        })
            .then(function (response: AxiosResponse) {
                // You can now work with the JSON response data directly
                console.log(response.data)
            })
            .catch(function (error: any) {
                console.error('axios error：', error);
            });
    }
}

const addClientNumUrl = process.env.ADD_CLIENTNUM_URL
export const addClientNum = async (name: string | undefined) => {
    if (name) {
        await axios({
            method: 'post',
            url: addClientNumUrl,
            data: {
                name: name
            }
        })
            .then(function (response: AxiosResponse) {
                // You can now work with the JSON response data directly
                console.log(response.data)
            })
            .catch(function (error: any) {
                console.error('axios error：', error);
            });
    }
}

const subClientNumUrl = process.env.SUB_CLIENTNUM_URL
export const subClientNum = async (name: string | undefined) => {
    if (name) {
        await axios({
            method: 'post',
            url: subClientNumUrl,
            data: {
                name: name
            }
        })
            .then(function (response: AxiosResponse) {
                // You can now work with the JSON response data directly
                console.log(response.data)
            })
            .catch(function (error: any) {
                console.error('axios error：', error);
            });
    }
}

const updateServerInfoUrl = process.env.UPDATE_SERVERINFO_URL
export const updateServerInfo = async (name: string | undefined, ip: string | undefined, udpPort: number, tcpPort: number, info: string | undefined) => {
    if (name && ip && info) {
        await axios({
            method: 'post',
            url: updateServerInfoUrl,
            data: {
                name: name,
                ip: ip,
                udpPort: udpPort.toString(),
                tcpPort: tcpPort.toString(),
                info: Buffer.from(info).toString('base64'),
                status: 'running'
            }
        })
            .then(function (response: AxiosResponse) {
                // You can now work with the JSON response data directly
                console.log(response.data)
            })
            .catch(function (error: any) {
                console.error('axios error：', error);
            });
    }
    else {
        console.log('updateServerInfo error, parameter invalid')
    }
}