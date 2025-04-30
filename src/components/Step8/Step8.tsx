import { useState } from "react";
import { Button, Box, TextField, IconButton, Typography } from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Step8() {
  const { formData } = useFormContext();
  const [prompt, setPrompt] = useState("");
  const [copy, setCopy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCopy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to generate copy");
      }
      const result = await response.json();
      setPrompt(result.prompt);
      setCopy(result.copy);
    } catch (err) {
      setError(err + "خطا در تولید کپی. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ color: "orange" }}>
      <Button
        variant="contained"
        onClick={handleGenerateCopy}
        disabled={loading}
        sx={{
          backgroundColor: "orange",
          color: "#000000",
          border: "1px solid orange",
          marginBottom: 2,
          "&:hover": { backgroundColor: "#e59400" },
        }}
      >
        {loading ? "در حال تولید..." : "تولید کپی"}
      </Button>
      {error && (
        <Typography sx={{ color: "orange", marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      {prompt && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ color: "orange" }}>
            پرامپت:
          </Typography>
          <TextField
            multiline
            fullWidth
            value={prompt}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => navigator.clipboard.writeText(prompt)}
                  sx={{ color: "orange" }}
                >
                  <ContentCopyIcon />
                </IconButton>
              ),
            }}
            sx={{
              "& .MuiInputBase-input": { color: "orange" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "orange" },
                "&:hover fieldset": { borderColor: "orange" },
                "&.Mui-focused fieldset": { borderColor: "orange" },
              },
            }}
          />
        </Box>
      )}
      {copy && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ color: "orange" }}>
            کپی تولیدشده:
          </Typography>
          <TextField
            multiline
            fullWidth
            value={copy}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => navigator.clipboard.writeText(copy)}
                  sx={{ color: "orange" }}
                >
                  <ContentCopyIcon />
                </IconButton>
              ),
            }}
            sx={{
              "& .MuiInputBase-input": { color: "orange" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "orange" },
                "&:hover fieldset": { borderColor: "orange" },
                "&.Mui-focused fieldset": { borderColor: "orange" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
