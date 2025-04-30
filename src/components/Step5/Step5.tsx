import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
} from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import {
  offerTypes,
  offerCategories,
  offerMagnets,
  urgencies,
} from "@/constants/options";

export default function Step5() {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (
    field: keyof typeof formData,
    value: string | string[]
  ) => {
    updateFormData({ [field]: value });
  };

  return (
    <Box sx={{ color: "orange" }}>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>نوع پیشنهاد</InputLabel>
        <Select
          value={formData.offerType || ""}
          onChange={(e) => handleChange("offerType", e.target.value)}
          sx={{
            color: "orange",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "orange" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
          }}
        >
          {offerTypes.map((type) => (
            <MenuItem key={type} value={type} sx={{ color: "orange" }}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>دسته پیشنهاد</InputLabel>
        <Select
          value={formData.offerCategory || ""}
          onChange={(e) => handleChange("offerCategory", e.target.value)}
          sx={{
            color: "orange",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "orange" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
          }}
        >
          {offerCategories.map((category) => (
            <MenuItem key={category} value={category} sx={{ color: "orange" }}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>آهنرباهای پیشنهاد</InputLabel>
        <Select
          multiple
          value={formData.offerMagnets || []}
          onChange={(e) =>
            handleChange("offerMagnets", e.target.value as string[])
          }
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  sx={{ backgroundColor: "orange", color: "#000000" }}
                />
              ))}
            </Box>
          )}
          sx={{
            color: "orange",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "orange" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
          }}
        >
          {offerMagnets.map((magnet) => (
            <MenuItem key={magnet} value={magnet} sx={{ color: "orange" }}>
              {magnet}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>فوریت</InputLabel>
        <Select
          value={formData.urgency || ""}
          onChange={(e) => handleChange("urgency", e.target.value)}
          sx={{
            color: "orange",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "orange" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "orange",
            },
          }}
        >
          {urgencies.map((urgency) => (
            <MenuItem key={urgency} value={urgency} sx={{ color: "orange" }}>
              {urgency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
