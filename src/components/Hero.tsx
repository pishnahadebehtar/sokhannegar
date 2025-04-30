"use client";

import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Fade,
  keyframes,
} from "@mui/material";

// Define animation for background gradient
const gradientShift = keyframes`
 0% { background-position: 0% 50%; }
 50% { background-position: 100% 50%; }
 100% { background-position: 0% 50%; }
`;

// Define animation for button click
const buttonClick = keyframes`
 0% { transform: scale(1); }
 50% { transform: scale(1.1); }
 100% { transform: scale(1); }
`;

interface HeroProps {
  onCallToActionClick: () => void;
  mode: "copywriting" | "chat";
  setMode: (mode: "copywriting" | "chat") => void;
}

export default function Hero({
  onCallToActionClick,
  mode,
  setMode,
}: HeroProps) {
  const handleButtonClick = (selectedMode: "copywriting" | "chat") => {
    setMode(selectedMode);
    onCallToActionClick();
  };

  return (
    <Box
      sx={{
        minHeight: { xs: "50vh", sm: "60vh" },
        background: "linear-gradient(45deg, #f28c38 30%, #ffd700 90%)",
        animation: `${gradientShift} 15s ease infinite`,
        backgroundSize: "200% 200%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, sm: 4 },
        textAlign: "center",
        color: "white",
        direction: "rtl",
      }}
    >
      <Fade in timeout={1000}>
        <Typography
          variant="h1" // Single variant for consistency
          sx={{
            fontSize: { xs: "2rem", sm: "3.75rem" }, // Responsive font size
            fontWeight: "bold",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "4px",
              backgroundColor: "white",
              borderRadius: "2px",
            },
          }}
          gutterBottom
        >
          به سخن نگار خوش آمدید
        </Typography>
      </Fade>
      <Fade in timeout={1200}>
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1rem", sm: "1.5rem" },
            mb: 4,
            maxWidth: "600px",
            opacity: 0.9,
          }}
        >
          با هوش مصنوعی، محتوای تبلیغاتی حرفه‌ای بسازید یا گفت‌وگوهای هوشمند را
          تجربه کنید
        </Typography>
      </Fade>
      <ButtonGroup
        sx={{
          mt: 2,
          gap: { xs: 1.5, sm: 2.5 }, // Increased spacing
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          "& .MuiButton-root": {
            minWidth: { xs: "100%", sm: "220px" },
            padding: { xs: "10px 16px", sm: "12px 24px" },
            borderRadius: "12px",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            },
          },
        }}
      >
        <Button
          onClick={() => handleButtonClick("copywriting")}
          sx={{
            backgroundColor: mode === "copywriting" ? "#f28c38" : "white",
            color: mode === "copywriting" ? "white" : "#f28c38",
            fontWeight: mode === "copywriting" ? "bold" : "normal",
            border:
              mode === "copywriting" ? "2px solid white" : "1px solid #f28c38",
            animation:
              mode === "copywriting" ? `${buttonClick} 0.3s ease` : "none",
            boxShadow:
              mode === "copywriting" ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
            "&:hover": {
              backgroundColor: mode === "copywriting" ? "#e07b30" : "#f0f0f0",
            },
          }}
        >
          متن تبلیغاتی با هوش مصنوعی درست کنید
        </Button>
        <Button
          onClick={() => handleButtonClick("chat")}
          sx={{
            backgroundColor: mode === "chat" ? "#f28c38" : "white",
            color: mode === "chat" ? "white" : "#f28c38",
            fontWeight: mode === "chat" ? "bold" : "normal",
            border: mode === "chat" ? "2px solid white" : "1px solid #f28c38",
            animation: mode === "chat" ? `${buttonClick} 0.3s ease` : "none",
            boxShadow: mode === "chat" ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
            "&:hover": {
              backgroundColor: mode === "chat" ? "#e07b30" : "#f0f0f0",
            },
          }}
        >
          صوت خود را به متن تبدیل کنید و با هوش مصنوعی گپ بزنید
        </Button>
      </ButtonGroup>
    </Box>
  );
}
