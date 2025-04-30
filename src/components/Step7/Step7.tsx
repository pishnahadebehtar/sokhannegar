import { Box, Typography, TextField } from "@mui/material";
import { useFormContext } from "@/context/FormContext";

export default function Step7() {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (
    field: keyof typeof formData,
    value: string | string[]
  ) => {
    updateFormData({ [field]: value });
  };

  return (
    <Box sx={{ color: "orange" }}>
      <Typography variant="h6" sx={{ color: "orange", marginBottom: 2 }}>
        بازبینی اطلاعات
      </Typography>
      <TextField
        label="نام کمپین"
        value={formData.campaignName || ""}
        onChange={(e) => handleChange("campaignName", e.target.value)}
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
      <TextField
        label="مرحله آگاهی مشتری"
        value={formData.awarenessStage || ""}
        onChange={(e) => handleChange("awarenessStage", e.target.value)}
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
      <TextField
        label="احساس اصلی پیام"
        value={formData.emotion || ""}
        onChange={(e) => handleChange("emotion", e.target.value)}
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
      <TextField
        label="کانال بازاریابی"
        value={formData.marketingChannel || ""}
        onChange={(e) => handleChange("marketingChannel", e.target.value)}
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
      <TextField
        label="صدای برند"
        value={formData.brandVoice || ""}
        onChange={(e) => handleChange("brandVoice", e.target.value)}
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
      <TextField
        label="هدف کمپین"
        value={formData.campaignGoal || ""}
        onChange={(e) => handleChange("campaignGoal", e.target.value)}
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
      <TextField
        label="جنسیت"
        value={formData.gender || ""}
        onChange={(e) => handleChange("gender", e.target.value)}
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
      <TextField
        label="گروه سنی"
        value={formData.ageGroup || ""}
        onChange={(e) => handleChange("ageGroup", e.target.value)}
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
      <TextField
        label="موقعیت جغرافیایی"
        value={formData.targetLocation || ""}
        onChange={(e) => handleChange("targetLocation", e.target.value)}
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
      <TextField
        label="سطح درآمد مشتری"
        value={formData.customerIncomeLevel || ""}
        onChange={(e) => handleChange("customerIncomeLevel", e.target.value)}
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
      <TextField
        label="نقاط درد مشتری"
        value={formData.customerPains.join(", ") || ""}
        onChange={(e) =>
          handleChange(
            "customerPains",
            e.target.value.split(", ").filter(Boolean)
          )
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
      <TextField
        label="خواسته‌های مشتری"
        value={formData.customerDesires.join(", ") || ""}
        onChange={(e) =>
          handleChange(
            "customerDesires",
            e.target.value.split(", ").filter(Boolean)
          )
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
      <TextField
        label="سرگرمی‌های مشتری"
        value={formData.customerHobbies.join(", ") || ""}
        onChange={(e) =>
          handleChange(
            "customerHobbies",
            e.target.value.split(", ").filter(Boolean)
          )
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
      <TextField
        label="کلمات کلیدی"
        value={formData.keywords.join(", ") || ""}
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
      <TextField
        label="نقطه فروش منحصر به فرد (USP)"
        value={formData.uniqueSellingPoint || ""}
        onChange={(e) => handleChange("uniqueSellingPoint", e.target.value)}
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
      <TextField
        label="محدوده قیمت محصول"
        value={formData.productPriceRange || ""}
        onChange={(e) => handleChange("productPriceRange", e.target.value)}
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
      <Typography
        variant="h6"
        sx={{ color: "orange", marginTop: 2, marginBottom: 1 }}
      >
        ویژگی‌ها و مزایا
      </Typography>
      {formData.productFeatures.map((item, index) => (
        <TextField
          key={index}
          label={`ویژگی ${index + 1}`}
          value={`${item.feature} - ${item.benefit}`}
          onChange={(e) => {
            const [newFeature, newBenefit] = e.target.value.split(" - ");
            const updatedFeatures = [...formData.productFeatures];
            updatedFeatures[index] = {
              feature: newFeature || "",
              benefit: newBenefit || "",
            };
            updateFormData({ productFeatures: updatedFeatures });
          }}
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
      ))}
      <TextField
        label="رقبا"
        value={formData.competitors.join(", ") || ""}
        onChange={(e) =>
          handleChange(
            "competitors",
            e.target.value.split(", ").filter(Boolean)
          )
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
      <TextField
        label="ایده اصلی"
        value={formData.mainIdea || ""}
        onChange={(e) => handleChange("mainIdea", e.target.value)}
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
      <TextField
        label="نوع پیشنهاد"
        value={formData.offerType || ""}
        onChange={(e) => handleChange("offerType", e.target.value)}
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
      <TextField
        label="دسته پیشنهاد"
        value={formData.offerCategory || ""}
        onChange={(e) => handleChange("offerCategory", e.target.value)}
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
      <TextField
        label="آهنرباهای پیشنهاد"
        value={formData.offerMagnets.join(", ") || ""}
        onChange={(e) =>
          handleChange(
            "offerMagnets",
            e.target.value.split(", ").filter(Boolean)
          )
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
      <TextField
        label="فوریت"
        value={formData.urgency || ""}
        onChange={(e) => handleChange("urgency", e.target.value)}
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
      <TextField
        label="دعوت به اقدام (CTA)"
        value={formData.cta || ""}
        onChange={(e) => handleChange("cta", e.target.value)}
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
