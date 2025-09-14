// use coinmarketcap api and get historical 

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { redisHandler } from "utils/redis";

//  https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest for bitcoin domincance and eth dominance and marketcap
//  https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical for fear and greed index
// https://pro-api.coinmarketcap.com/v3/index/cmc100-historical for cmc100 index


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await redisHandler.delete('droom_price_index_info');
    let info = await redisHandler.get<any>('droom_price_index_info');
    // if (info) {
    //     return res.status(200).json(info);
    // }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    let cmc_api_key = process.env.CMC_API_KEY;
    info = {};
    try {
        let response = await axios.get(`https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest`, {
            headers: {
                'X-CMC_PRO_API_KEY': cmc_api_key
            } as any
        });
        let data = response.data;
        info.marketcap = {
            value: data.data.quote.USD.total_market_cap,
            change: data.data.quote.USD.total_market_cap_yesterday_percentage_change
        }
        info.dominance = {
            btc: data.data.btc_dominance,
            eth: data.data.eth_dominance
        }
        info.volume = {
            value: data.data.quote.USD.total_volume_24h,
            change: data.data.quote.USD.total_volume_24h_yesterday_percentage_change
        }
        
        response = await axios.get(`https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical`, {
            headers: {
                'X-CMC_PRO_API_KEY': cmc_api_key
            } as any
        });
        data = response.data;
        info.fear_and_greed = {
            value: data.data[0].value,
            classification: data.data[0].value_classification
        }
        // sleep for 1 second
        response = await axios.get(`https://pro-api.coinmarketcap.com/v3/index/cmc100-latest`, {
            headers: {
                'X-CMC_PRO_API_KEY': cmc_api_key
            } as any
        });
        data = response.data;
        info.cmc100 = {
            value: data.data.value,
            change: data.data.value_24h_percentage_change
        }

        await redisHandler.set('droom_price_index_info', info, { expirationTime: 12*60*60 });
        res.status(200).json(info);
    } catch (error) {
        console.error('Error fetching CMC data:', error);
        res.status(500).json({ error: 'Error fetching chart data' });
    }
}