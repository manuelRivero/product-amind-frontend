import client from "api/client";

export const getConfig = (access)=>{
    console.log("config request")
    return client.get(`api/config/get-config`,
        {
            headers: {
                'x-token': access,
            },
        }
    )
}

export const editConfig = (access, form)=>{

    return client.post(`api/config/edit-config`, form,
        {
            headers: {
                'x-token': access,
            },
        }
    )
}