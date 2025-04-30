import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import {
  awarenessStages,
  emotions,
  marketingChannels,
  brandVoices,
  campaignGoals,
} from "@/constants/options";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function Step1() {
  const { formData, updateFormData } = useFormContext();
  const { isSignedIn } = useAuth();

  const handleChange = (field: keyof typeof formData, value: string | null) => {
    updateFormData({ [field]: value || "" }); // Default to empty string if null
  };

  if (!isSignedIn) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" sx={{ color: "#FFA500" }}>
          لطفاً برای شروع وارد شوید
        </Typography>
        <SignInButton mode="modal">
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#FFA500",
              color: "#000000",
              border: "1px solid #FFA500",
              "&:hover": { backgroundColor: "#e59400" },
            }}
          >
            ورود
          </Button>
        </SignInButton>
      </Box>
    );
  }

  return (
    <Box sx={{ color: "#FFA500" }}>
      <TextField
        label="نام کمپین"
        value={formData.campaignName || ""}
        onChange={(e) => handleChange("campaignName", e.target.value)}
        fullWidth
        margin="normal"
        sx={{
          "& .MuiInputBase-input": { color: "#FFA500" },
          "& .MuiInputLabel-root": { color: "#FFA500" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#FFA500" },
            "&:hover fieldset": { borderColor: "#FFA500" },
            "&.Mui-focused fieldset": { borderColor: "#FFA500" },
          },
        }}
      />
      <Autocomplete
        options={awarenessStages}
        value={formData.awarenessStage || ""}
        onChange={(_, newValue) => handleChange("awarenessStage", newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="مرحله آگاهی مشتری"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#FFA500" },
              "& .MuiInputLabel-root": { color: "#FFA500" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFA500" },
                "&:hover fieldset": { borderColor: "#FFA500" },
                "&.Mui-focused fieldset": { borderColor: "#FFA500" },
              },
            }}
          />
        )}
        sx={{ color: "#FFA500" }}
      />
      <Autocomplete
        options={emotions}
        value={formData.emotion || ""}
        onChange={(_, newValue) => handleChange("emotion", newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="احساس اصلی پیام"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#FFA500" },
              "& .MuiInputLabel-root": { color: "#FFA500" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFA500" },
                "&:hover fieldset": { borderColor: "#FFA500" },
                "&.Mui-focused fieldset": { borderColor: "#FFA500" },
              },
            }}
          />
        )}
        sx={{ color: "#FFA500" }}
      />
      <Autocomplete
        options={marketingChannels}
        value={formData.marketingChannel || ""}
        onChange={(_, newValue) => handleChange("marketingChannel", newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="کانال بازاریابی"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#FFA500" },
              "& .MuiInputLabel-root": { color: "#FFA500" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFA500" },
                "&:hover fieldset": { borderColor: "#FFA500" },
                "&.Mui-focused fieldset": { borderColor: "#FFA500" },
              },
            }}
          />
        )}
        sx={{ color: "#FFA500" }}
      />
      <Autocomplete
        options={brandVoices}
        value={formData.brandVoice || ""}
        onChange={(_, newValue) => handleChange("brandVoice", newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="صدای برند"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#FFA500" },
              "& .MuiInputLabel-root": { color: "#FFA500" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFA500" },
                "&:hover fieldset": { borderColor: "#FFA500" },
                "&.Mui-focused fieldset": { borderColor: "#FFA500" },
              },
            }}
          />
        )}
        sx={{ color: "#FFA500" }}
      />
      <Autocomplete
        options={campaignGoals}
        value={formData.campaignGoal || ""}
        onChange={(_, newValue) => handleChange("campaignGoal", newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="هدف کمپین"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#FFA500" },
              "& .MuiInputLabel-root": { color: "#FFA500" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFA500" },
                "&:hover fieldset": { borderColor: "#FFA500" },
                "&.Mui-focused fieldset": { borderColor: "#FFA500" },
              },
            }}
          />
        )}
        sx={{ color: "#FFA500" }}
      />
    </Box>
  );
}
