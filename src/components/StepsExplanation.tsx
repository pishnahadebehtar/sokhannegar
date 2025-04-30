import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Flag as FlagIcon,
  Lightbulb as LightbulbIcon,
  Layers as LayersIcon,
  Chat as ChatIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const steps = [
  {
    title: "اطلاعات کمپین",
    description: "اطلاعات اولیه کمپین خود را وارد کنید، مانند نام و هدف.",
    icon: <AssignmentIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "مخاطبان هدف",
    description:
      "مخاطبان هدف خود را تعریف کنید تا محتوا به درستی هدف‌گذاری شود.",
    icon: <PeopleIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "اهداف محتوا",
    description:
      "اهداف محتوا را مشخص کنید، مانند افزایش آگاهی یا ترغیب به اقدام.",
    icon: <FlagIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "ایده اصلی",
    description: "ایده اصلی محتوای خود را انتخاب یا تولید کنید。",
    icon: <LightbulbIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "ساختار محتوا",
    description: "ساختار محتوای خود را طراحی کنید، مانند عنوان و بدنه.",
    icon: <LayersIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "لحن و سبک",
    description:
      "لحن و سبک محتوای خود را تنظیم کنید تا با برند شما همخوانی داشته باشد.",
    icon: <ChatIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "فراخوان به اقدام",
    description:
      "یک فراخوان به اقدام مؤثر اضافه کنید تا مخاطبان را به عمل ترغیب کند.",
    icon: <CampaignIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
  {
    title: "بررسی و نهایی‌سازی",
    description: "محتوای تولید شده را بررسی و ویرایش کنید تا نهایی شود。",
    icon: <CheckCircleIcon sx={{ fontSize: 40, color: "orange" }} />,
  },
];

export default function StepsExplanation() {
  return (
    <Box
      sx={{
        padding: 4,
        direction: "rtl",
        maxWidth: "1200px", // Limits width for larger screens
        margin: "0 auto", // Centers the content
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
        مراحل تولید محتوا
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4, // Spacing between cards
          justifyContent: "center",
        }}
      >
        {steps.map((step, index) => (
          <Card
            key={index}
            sx={{
              width: { xs: "100%", sm: "45%", md: "22%" }, // Responsive widths: 1 column mobile, 2 tablet, 4 desktop
              textAlign: "center",
              height: "100%", // Consistent height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: 3, // Slight shadow for depth
            }}
          >
            <CardContent>
              <Box sx={{ marginBottom: 2 }}>{step.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {step.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {step.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
