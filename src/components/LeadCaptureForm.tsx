import { useState } from "react";
import { Mail, User, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateLeadForm, ValidationError } from "@/lib/validation";
import { useLeadStore } from "@/lib/lead-store";

type FormValues = {
  name: string;
  email: string;
  industry: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  name: "",
  email: "",
  industry: "",
};

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail & E-commerce",
  "Manufacturing",
  "Consulting",
  "Other",
];

const API_CONFIG = {
  url: "https://ytyopyznqpnylebzibby.supabase.co/functions/v1/clever-task",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eW9weXpucXBueWxlYnppYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI3NTUsImV4cCI6MjA3MDEyODc1NX0.nr9WV_ybqZ6PpWT6GjAQm0Bsdr-Q5IejEhToV34VY4E",
  },
};

export const LeadCaptureForm = () => {
  const [values, setValues] = useState<FormValues>(DEFAULT_FORM_VALUES);
  const [validationIssues, setValidationIssues] = useState<ValidationError[]>(
    []
  );
  const [isComplete, setIsComplete] = useState(false);
  const { leads, addLead } = useLeadStore();

  const fieldHasError = (fieldName: string) =>
    validationIssues.some((issue) => issue.field === fieldName);

  const getValidationMessage = (fieldName: string) =>
    validationIssues.find((issue) => issue.field === fieldName)?.message;

  const modifyField = (fieldName: keyof FormValues, newValue: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: newValue }));

    if (fieldHasError(fieldName)) {
      setValidationIssues((prev) =>
        prev.filter((issue) => issue.field !== fieldName)
      );
    }
  };

  const prepareLeadData = () => ({
    ...values,
    submitted_at: new Date().toISOString(),
  });

  const sendDataToApi = async () => {
    try {
      const response = await fetch(API_CONFIG.url, {
        method: "POST",
        headers: API_CONFIG.headers,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "API request failed");
      }

      return response.json();
    } catch (error) {
      console.error("API communication error:", error);
      throw error;
    }
  };

  const processFormSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationResults = validateLeadForm(values);
    setValidationIssues(validationResults);

    if (validationResults.length > 0) return;

    try {
      await sendDataToApi();
      const newLead = prepareLeadData();
      await addLead(newLead);
      setIsComplete(true);
      setValues(DEFAULT_FORM_VALUES);
    } catch {
      // Error handling is done in sendDataToApi
    }
  };

  const renderInputField = (
    IconComponent: React.ComponentType<{ className?: string }>,
    fieldName: keyof FormValues,
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="space-y-2">
      <div className="relative">
        <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          {...inputProps}
          value={values[fieldName]}
          onChange={(e) => modifyField(fieldName, e.target.value)}
          className={`pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground transition-smooth ${
            fieldHasError(fieldName)
              ? "border-destructive"
              : "focus:border-accent focus:shadow-glow"
          }`}
        />
      </div>
      {fieldHasError(fieldName) && (
        <p className="text-destructive text-sm animate-fade-in">
          {getValidationMessage(fieldName)}
        </p>
      )}
    </div>
  );

  const renderIndustryDropdown = () => (
    <div className="space-y-2">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Select
          value={values.industry}
          onValueChange={(value) => modifyField("industry", value)}
        >
          <SelectTrigger
            className={`pl-10 h-12 bg-input border-border text-foreground transition-smooth ${
              fieldHasError("industry")
                ? "border-destructive"
                : "focus:border-accent focus:shadow-glow"
            }`}
          >
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem
                key={industry
                  .toLowerCase()
                  .replace(/ & /g, "-")
                  .replace(/\s+/g, "-")}
                value={industry
                  .toLowerCase()
                  .replace(/ & /g, "-")
                  .replace(/\s+/g, "-")}
              >
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {fieldHasError("industry") && (
        <p className="text-destructive text-sm animate-fade-in">
          {getValidationMessage("industry")}
        </p>
      )}
    </div>
  );

  const renderSuccessState = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow animate-glow">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-3">
          Welcome aboard! 🎉
        </h2>
        <p className="text-muted-foreground mb-2">
          Thanks for joining! We'll be in touch soon with updates.
        </p>
        <p className="text-sm text-accent mb-8">
          You're #{leads.length} in this session
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-foreground">
              💡 <strong>What's next?</strong>
              <br />
              We'll send you exclusive updates, early access, and
              behind-the-scenes content.
            </p>
          </div>

          <Button
            onClick={() => setIsComplete(false)}
            variant="outline"
            className="w-full border-border hover:bg-accent/10 transition-smooth group"
          >
            Submit Another Lead
            <User className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Follow our journey on social media for real-time updates
          </p>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Join Our Community
          </h2>
          <p className="text-muted-foreground">
            Be the first to know when we launch
          </p>
        </div>

        <form onSubmit={processFormSubmission} className="space-y-6">
          {renderInputField(User, "name", {
            type: "text",
            placeholder: "Your name",
          })}

          {renderInputField(Mail, "email", {
            type: "email",
            placeholder: "your@email.com",
          })}

          {renderIndustryDropdown()}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-[0_0_60px_hsl(210_100%_60%/0.3)] transition-smooth transform hover:scale-[1.02]"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Get Early Access
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By submitting, you agree to receive updates. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );

  return isComplete ? renderSuccessState() : renderForm();
};
