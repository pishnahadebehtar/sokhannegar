import {
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { priceRanges } from "@/constants/options";

export default function Step3() {
  const { formData, updateFormData } = useFormContext();
  const [feature, setFeature] = useState("");
  const [benefit, setBenefit] = useState("");
  const [competitor, setCompetitor] = useState("");

  const handleAddFeature = () => {
    if (feature && benefit) {
      updateFormData({
        productFeatures: [...formData.productFeatures, { feature, benefit }],
      });
      setFeature("");
      setBenefit("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    updateFormData({
      productFeatures: formData.productFeatures.filter((_, i) => i !== index),
    });
  };

  const handleAddCompetitor = () => {
    if (competitor) {
      updateFormData({
        competitors: [...formData.competitors, competitor],
      });
      setCompetitor("");
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    updateFormData({
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  return (
    <Box sx={{ color: "orange" }}>
      <TextField
        label="نقطه فروش منحصر به فرد (USP)"
        value={formData.uniqueSellingPoint || ""}
        onChange={(e) => updateFormData({ uniqueSellingPoint: e.target.value })}
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
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>محدوده قیمت محصول</InputLabel>
        <Select
          value={formData.productPriceRange || ""}
          onChange={(e) =>
            updateFormData({ productPriceRange: e.target.value })
          }
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
          {priceRanges.map((range) => (
            <MenuItem key={range} value={range} sx={{ color: "orange" }}>
              {range}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="h6" sx={{ color: "orange", marginTop: 2 }}>
        ویژگی‌ها و مزایا
      </Typography>
      <Box display="flex" gap={2}>
        <TextField
          label="ویژگی"
          value={feature}
          onChange={(e) => setFeature(e.target.value)}
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
        <TextField
          label="مزیت"
          value={benefit}
          onChange={(e) => setBenefit(e.target.value)}
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
          onClick={handleAddFeature}
          sx={{
            backgroundColor: "orange",
            color: "#000000",
            border: "1px solid orange",
            marginTop: 2,
            "&:hover": { backgroundColor: "#e59400" },
          }}
        >
          افزودن
        </Button>
      </Box>
      <List>
        {formData.productFeatures.map((item, index) => (
          <ListItem
            key={index}
            sx={{ color: "orange", border: "1px solid orange", marginTop: 1 }}
          >
            <ListItemText
              primary={`${item.feature} - ${item.benefit}`}
              sx={{ color: "orange" }}
            />
            <IconButton
              onClick={() => handleRemoveFeature(index)}
              sx={{ color: "orange" }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" sx={{ color: "orange", marginTop: 2 }}>
        رقبا
      </Typography>
      <Box display="flex" gap={2}>
        <TextField
          label="نام رقیب"
          value={competitor}
          onChange={(e) => setCompetitor(e.target.value)}
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
          onClick={handleAddCompetitor}
          sx={{
            backgroundColor: "orange",
            color: "#000000",
            border: "1px solid orange",
            marginTop: 2,
            "&:hover": { backgroundColor: "#e59400" },
          }}
        >
          افزودن
        </Button>
      </Box>
      <List>
        {formData.competitors.map((comp, index) => (
          <ListItem
            key={index}
            sx={{ color: "orange", border: "1px solid orange", marginTop: 1 }}
          >
            <ListItemText primary={comp} sx={{ color: "orange" }} />
            <IconButton
              onClick={() => handleRemoveCompetitor(index)}
              sx={{ color: "orange" }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
