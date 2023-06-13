import client from "api/client";

export const login = (data)=>{
    // console.log("auth request")
    return client.post(`api/auth/admin`, data)
}