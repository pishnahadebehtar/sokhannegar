import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useFormContext } from "@/context/FormContext";

export default function Step4() {
  const { formData, updateFormData } = useFormContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-main-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const ideas = await response.json();
      setSuggestions(ideas);
    } catch (err) {
      setError("خطا در دریافت پیشنهادات. لطفاً دوباره تلاش کنید." + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (idea: string) => {
    updateFormData({ mainIdea: idea });
  };

  return (
    <Box sx={{ color: "orange" }}>
      <TextField
        label="ایده اصلی"
        value={formData.mainIdea || ""} // Ensure no undefined errors
        onChange={(e) => updateFormData({ mainIdea: e.target.value })}
        fullWidth
        margin="normal"
        sx={{
          "& .MuiInputBase-input": { color: "orange" },
          "& .MuiInputLabel-root": { color: "orange" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "orange" },
            "&:hover fieldset": { borderColor: "orange" },
            "&.Mui-focused fieldset": { borderColor: "orange" },
          },
        }}
      />
      <Button
        variant="contained"
        onClick={handleGetSuggestions}
        disabled={loading}
        sx={{
          backgroundColor: "orange",
          color: "#000000", // Black text for contrast
          border: "1px solid orange",
          marginTop: 2,
          "&:hover": { backgroundColor: "#e59400" }, // Slightly darker orange on hover
        }}
      >
        {loading ? "در حال بارگذاری..." : "دریافت پیشنهادات"}
      </Button>
      {error && (
        <Typography sx={{ color: "orange", marginTop: 2 }}>{error}</Typography>
      )}
      {suggestions.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ color: "orange" }}>
            پیشنهادات:
          </Typography>
          <List>
            {suggestions.map((idea, index) => (
              <ListItem
                key={index}
                component="button"
                onClick={() => handleSelectSuggestion(idea)}
                sx={{
                  color: "orange",
                  border: "1px solid orange",
                  cursor: "pointer",
                  marginTop: 1,
                  "&:hover": { backgroundColor: "rgba(255, 165, 0, 0.1)" }, // Light orange hover effect
                }}
              >
                <ListItemText primary={idea} sx={{ color: "orange" }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
