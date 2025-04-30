"use client";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  StepIconProps,
} from "@mui/material";
import { useState, forwardRef } from "react";
import { useMediaQuery } from "@mui/material";
import { useFormContext } from "@/context/FormContext";
import { useAuth } from "@clerk/nextjs";
import Step1 from "./Step1/Step1";
import Step2 from "./Step2/Step2";
import Step3 from "./Step3/Step3";
import Step4 from "./Step4/Step4";
import Step5 from "./Step5/Step5";
import Step6 from "./Step6/Step6";
import Step7 from "./Step7/Step7";
import Step8 from "./Step8/Step8";

// Define steps
const steps = [
  "اطلاعات اولیه",
  "پرسونای مشتری",
  "تحقیق محصول",
  "ایده اصلی",
  "پیشنهاد",
  "دعوت به اقدام",
  "بازبینی",
  "تولید کپی",
];

// Custom StepIcon
const CustomStepIcon = (props: StepIconProps) => {
  const { active, completed } = props;
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: active || completed ? "#FFA500" : "grey.500",
        color: active || completed ? "#000000" : "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
      }}
    >
      {props.icon}
    </Box>
  );
};

// Define props type including ref

// Use forwardRef with proper typing
const CopywritingStepper = forwardRef<HTMLDivElement>((props, ref) => {
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const { clearFormData } = useFormContext();
  const { isSignedIn } = useAuth();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      clearFormData();
      setActiveStep(0);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 />;
      case 3:
        return <Step4 />;
      case 4:
        return <Step5 />;
      case 5:
        return <Step6 />;
      case 6:
        return <Step7 />;
      case 7:
        return <Step8 />;
      default:
        return "مرحله ناشناخته";
    }
  };

  return (
    <Box
      ref={ref} // Attach ref to the root Box
      sx={{
        padding: 2,
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        gap: 2,
      }}
    >
      <Stepper
        activeStep={activeStep}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          width: isMobile ? "30%" : "100%",
          order: isMobile ? 1 : 0,
          "& .MuiStepLabel-label": { color: "#FFA500" },
          "& .MuiStepLabel-root": {
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            alignItems: "center",
            justifyContent: isMobile ? "flex-end" : "center",
            textAlign: isMobile ? "right" : "center",
            gap: isMobile ? 1 : 0,
          },
          "& .MuiStepConnector-line": { borderColor: "transparent" },
          ...(!isMobile && {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }),
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          width: isMobile ? "70%" : "100%",
          order: isMobile ? 0 : 1,
          mt: isMobile ? 0 : 2,
        }}
      >
        {activeStep === steps.length ? (
          <p>فرم تکمیل شد</p>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{
                  color: "#FFA500",
                  borderColor: "#FFA500",
                  "&:hover": { borderColor: "#e59400", color: "#e59400" },
                }}
              >
                بازگشت
              </Button>
              {isSignedIn && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#FFA500",
                    color: "#000000",
                    "&:hover": { backgroundColor: "#e59400" },
                  }}
                >
                  {activeStep === steps.length - 1 ? "شروع مجدد" : "بعدی"}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
});

CopywritingStepper.displayName = "CopywritingStepper";

export default CopywritingStepper;
