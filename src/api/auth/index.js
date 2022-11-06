import client from "api/client";

export const login = (data)=>{
    return client.post(`api/auth/admin`, data)
}