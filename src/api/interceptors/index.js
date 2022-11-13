import { logout } from "../../store/auth";
import client from "../client"
import {history }from "./../../index"
export const setUpInterceptor = (store) => {

    client.interceptors.response.use(
      (response) => {
        // console.log("interceptor response", response);
        return response;

      },
      (error) => {
        console.log("error on interceptor", error);
        if (error.response?.status === 401) {
            store.dispatch(logout())
            history.push("/auth")
        }
        return Promise.reject(error);
      }
    );

}