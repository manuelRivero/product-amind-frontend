import { createTheme } from '@material-ui/core/styles'
const theme = createTheme ({
  palette: {
    white:"#FFF"
  },
  typography: {
    // Tell Material UI what the font-size on the html element is.
    caption:{
      fontSize: 14,
      display: 'block',
      fontWeight: 'lighter'
    }
  },
});


export default theme