import {
  defaultFont,
  whiteColor,
} from "assets/jss/material-dashboard-react.js";

import dropdownStyle from "assets/jss/material-dashboard-react/dropdownStyle.js";

const headerLinksStyle = (theme) => ({
  ...dropdownStyle(theme),
  

  linkText: {
    zIndex: "4",
    ...defaultFont,
    fontSize: "14px",
    margin: "0px",
  },
  buttonLink: {
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      margin: "10px 15px 0",
      width: "-webkit-fill-available",
      "& svg": {
        width: "24px",
        height: "30px",
        marginRight: "15px",
        marginLeft: "-15px",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        fontSize: "24px",
        lineHeight: "30px",
        width: "24px",
        height: "30px",
        marginRight: "15px",
        marginLeft: "-15px",
      },
      "& > span": {
        justifyContent: "flex-start",
        width: "100%",
      },
    },
  },
  margin: {
    zIndex: "4",
    margin: "0",
  },
  searchIcon: {
    width: "17px",
    zIndex: "4",
  },
  notifications: {
    zIndex: "4",
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      top: "0px",
      right: "0px",
      fontSize: "11px",
      fontWeight: "bold",
      background: "#f44336", // Rojo Material Design
      color: whiteColor,
      minWidth: "18px",
      height: "18px",
      borderRadius: "9px",
      textAlign: "center",
      lineHeight: "18px",
      verticalAlign: "middle",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",

    },
    [theme.breakpoints.down("sm")]: {
      ...defaultFont,
      fontSize: "14px",
      marginRight: "8px",
      background: "#f44336",
      color: whiteColor,
      padding: "2px 6px",
      borderRadius: "10px",
      fontWeight: "bold",
    },
  },
  managerWrapper:{
    display:'flex'
  },
  manager: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    "& > button":{
      margin:0,
      padding: '.5rem'
    },
    "& > span":{
      color: '#999'
    }
  },
  icons: {
    color: "#555555"
  }
});

export default headerLinksStyle;
