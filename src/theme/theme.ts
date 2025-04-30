import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl", // Set RTL globally
  palette: {
    text: {
      primary: "#FFA500", // Hex code for orange
    },
    background: {
      default: "#000000", // Black background
    },
  },
  typography: {
    fontFamily: "FarNazanin, sans-serif", // Apply FarNazanin as the default font
    fontSize: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#000000", // Ensure black background
          color: "#FFA500", // Ensure orange text
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333", // Dark background for Autocomplete dropdowns
          color: "#FFA500", // Orange text for dropdown options
        },
      },
    },
  },
});

export default theme;
