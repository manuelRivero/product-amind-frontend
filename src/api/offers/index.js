import client from "api/client";

export const addOffer = (data)=>{
    console.log('request')
    return client.post(`api/offers/add-offer`, data)
}