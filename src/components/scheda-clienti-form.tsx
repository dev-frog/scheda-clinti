"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomerOnboarding from "./customer-onboarding";
import ProductSelection from "./product-selection";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const formSchema = z.object({
  // Customer information
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  telephone: z
    .string()
    .min(5, { message: "Please enter a valid phone number" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  additionalNotes: z.string().optional(),

  // Product selections
  products: z
    .array(
      z.object({
        type: z.string(),
        details: z.record(z.any()),
      })
    )
    .optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export default function SchedaClientiForm() {
  const [step, setStep] = useState(1);
  const { toast, active, message } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      telephone: "",
      city: "",
      address: "",
      additionalNotes: "",
      products: [],
    },
  });

  function onSubmit(data: FormValues) {
    if (step === 1) {
      setStep(2);
      return;
    }

    // Handle final submission
    console.log("Form submitted:", data);
    
    // Check for WordPress submission handler (from wp-bridge.js)
    if ((window as any).submitToWordPress) {
        (window as any).submitToWordPress(data)
            .then(() => {
                toast({
                    title: "Order Placed Successfully!",
                });
                form.reset();
                setStep(1);
            })
            .catch((error: any) => {
                console.error("Submission error:", error);
                toast({
                    title: "Error: " + (error.message || "Unknown error"),
                });
            });
    } else {
        toast({
            title: "Order Placed Successfully!",
        });
        // Reset form and go back to step 1
        form.reset();
        setStep(1);
    }
  }

  return (
    <div className="space-y-8 py-6 relative">
      {/* Custom Toast Notification */}
      {active && (
        <div className="fixed bottom-4 right-4 z-50 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 duration-300">
          {message}
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Scheda Clienti</h1>
        <p className="text-muted-foreground">
          Complete the form below to place your furniture order.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">Step {step} of 2</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 ? (
            <CustomerOnboarding form={form} />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <h2 className="text-2xl font-bold">Choose Your Products</h2>
              </div>
              <ProductSelection form={form} />
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 mt-8 py-6 text-lg font-medium"
            size="lg"
          >
            {step === 1 ? "Next: Select Your Products" : "Place Your Order"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
