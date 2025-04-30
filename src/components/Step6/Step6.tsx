import { TextField, Box } from "@mui/material";
import { useFormContext } from "@/context/FormContext";

export default function Step6() {
  const { formData, updateFormData } = useFormContext();

  return (
    <Box sx={{ color: "orange" }}>
      <TextField
        label="فراخوان عمل (CTA)"
        value={formData.cta || ""}
        onChange={(e) => updateFormData({ cta: e.target.value })}
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
    </Box>
  );
}
