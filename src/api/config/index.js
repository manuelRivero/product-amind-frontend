import client from "api/client";

export const getConfig = () => {
    console.log("config request")
    return client.get(`api/config/get-config`)
}

export const editConfig = (form) => {
    return client.post(`api/config/edit-config`, form)
}