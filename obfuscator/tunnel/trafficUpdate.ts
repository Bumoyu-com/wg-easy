
import axios, { AxiosResponse } from 'axios';

const trafficUpdateUrl = "https://bumoyu-saas-morphvpn-api.zhendong-ge.workers.dev/db/morphVpn_user/addTrafficByUserId";

export const updateTraffic = async (userId: string | undefined, traffic: number | undefined) => {
    if (userId && traffic) {
        await axios({
            method: 'post',
            url: trafficUpdateUrl,
            data: {
                id: userId,
                traffic: traffic
            }
        })
            .then(function (response) {
                // You can now work with the JSON response data directly
                console.log(response.data)
            })
            .catch(function (error) {
                console.error('axios error：', error);
            });
    }
}