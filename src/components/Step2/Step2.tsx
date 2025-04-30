import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  TextField,
} from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import {
  genders,
  ageGroups,
  customerPains,
  customerDesires,
  targetLocations,
  incomeLevels,
  customerHobbies,
} from "@/constants/options";

export default function Step2() {
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
        <InputLabel sx={{ color: "orange" }}>جنسیت</InputLabel>
        <Select
          value={formData.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
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
          {genders.map((gender) => (
            <MenuItem key={gender} value={gender} sx={{ color: "orange" }}>
              {gender}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>گروه سنی</InputLabel>
        <Select
          value={formData.ageGroup}
          onChange={(e) => handleChange("ageGroup", e.target.value)}
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
          {ageGroups.map((age) => (
            <MenuItem key={age} value={age} sx={{ color: "orange" }}>
              {age}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>موقعیت جغرافیایی</InputLabel>
        <Select
          value={formData.targetLocation}
          onChange={(e) => handleChange("targetLocation", e.target.value)}
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
          {targetLocations.map((location) => (
            <MenuItem key={location} value={location} sx={{ color: "orange" }}>
              {location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>سطح درآمد</InputLabel>
        <Select
          value={formData.customerIncomeLevel}
          onChange={(e) => handleChange("customerIncomeLevel", e.target.value)}
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
          {incomeLevels.map((level) => (
            <MenuItem key={level} value={level} sx={{ color: "orange" }}>
              {level}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>نقاط درد مشتری</InputLabel>
        <Select
          multiple
          value={formData.customerPains}
          onChange={(e) =>
            handleChange("customerPains", e.target.value as string[])
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
          {customerPains.map((pain) => (
            <MenuItem key={pain} value={pain} sx={{ color: "orange" }}>
              {pain}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>خواسته‌های مشتری</InputLabel>
        <Select
          multiple
          value={formData.customerDesires}
          onChange={(e) =>
            handleChange("customerDesires", e.target.value as string[])
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
          {customerDesires.map((desire) => (
            <MenuItem key={desire} value={desire} sx={{ color: "orange" }}>
              {desire}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "orange" }}>سرگرمی‌های مشتری</InputLabel>
        <Select
          multiple
          value={formData.customerHobbies}
          onChange={(e) =>
            handleChange("customerHobbies", e.target.value as string[])
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
          {customerHobbies.map((hobby) => (
            <MenuItem key={hobby} value={hobby} sx={{ color: "orange" }}>
              {hobby}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="کلمات کلیدی (با کاما جدا کنید)"
        value={formData.keywords.join(", ")}
        onChange={(e) =>
          handleChange("keywords", e.target.value.split(", ").filter(Boolean))
        }
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
