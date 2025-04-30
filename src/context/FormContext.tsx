"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { FormData } from "@/types/formData";

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  clearFormData: () => void; // Add clearFormData to the interface
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Initial form data as a constant for reuse
const initialFormData: FormData = {
  campaignName: "",
  awarenessStage: "",
  emotion: "",
  marketingChannel: "",
  gender: "",
  customerPains: [],
  customerDesires: [],
  ageGroup: "",
  uniqueSellingPoint: "",
  productFeatures: [],
  mainIdea: "",
  offerType: "",
  offerCategory: "",
  offerMagnets: [],
  urgency: "",
  cta: "",
  brandVoice: "",
  targetLocation: "",
  customerIncomeLevel: "",
  campaignGoal: "",
  keywords: [],
  competitors: [],
  productPriceRange: "",
  customerHobbies: [],
};

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const clearFormData = () => {
    setFormData(initialFormData); // Reset to initial values
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, clearFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
