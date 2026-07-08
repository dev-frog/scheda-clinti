"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, CheckCircle, ShoppingBag, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomerOnboarding from "./customer-onboarding";
import ProductSelection from "./product-selection";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const formSchema = z.object({
  // Customer Anagrafica Information
  name: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri" }),
  taxId: z.string().min(5, { message: "Il Codice Fiscale/P.IVA deve essere di almeno 5 caratteri" }),
  telephone: z
    .string()
    .min(5, { message: "Inserisci un numero di telefono valido" }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }),

  // Installation Address
  addressStreet: z.string().min(2, { message: "Via/Piazza è obbligatoria" }),
  addressNumber: z.string().min(1, { message: "Il civico è obbligatorio" }),
  zipCode: z.string().min(5, { message: "Il CAP deve essere di almeno 5 caratteri" }),
  city: z.string().min(2, { message: "La città deve essere di almeno 2 caratteri" }),
  province: z.string().min(2, { message: "La provincia è obbligatoria" }),

  // Logistical Site Details
  floor: z.string().optional(),
  stairInternal: z.string().optional(),
  hasElevator: z.boolean().optional(),
  accessNotes: z.string().optional(),

  // General notes
  additionalNotes: z.string().optional(),

  // Technical Parquet Fields
  productType: z.string().optional(),
  surfaceArea: z.string().optional(),
  subfloorCondition: z.string().optional(),
  installationType: z.string().optional(),
  underlayNeeded: z.string().optional(),
  skirtingType: z.string().optional(),
  skirtingMeters: z.string().optional(),
  timing: z.string().optional(),

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
  const [showThankYou, setShowThankYou] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const { toast, active, message } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      taxId: "",
      telephone: "",
      email: "",
      addressStreet: "",
      addressNumber: "",
      zipCode: "",
      city: "",
      province: "",
      floor: "",
      stairInternal: "",
      hasElevator: false,
      accessNotes: "",
      additionalNotes: "",
      productType: "",
      surfaceArea: "",
      subfloorCondition: "",
      installationType: "",
      underlayNeeded: "",
      skirtingType: "",
      skirtingMeters: "",
      timing: "",
      products: [],
    },
  });

  function onSubmit(data: FormValues) {
    if (step === 1) {
      setStep(2);
      return false;
    }

    // Handle final submission
    console.log("Scheda Clienti: Form submitted:", data);

    // Check for WordPress submission handler (from wp-bridge.js)
    if ((window as any).submitToWordPress) {
        console.log("Scheda Clienti: Using WordPress submission handler");
        (window as any).submitToWordPress(data)
            .then((response: any) => {
                console.log("Scheda Clienti: Submission successful", response);
                setSubmittedData(data);
                setShowThankYou(true);
                toast({
                    title: "Ordine Inviato con Successo!",
                });
            })
            .catch((error: any) => {
                console.error("Scheda Clienti: Submission error:", error);
                toast({
                    title: "Errore: " + (error.message || "Errore sconosciuto"),
                });
            });
    } else {
        console.log("Scheda Clienti: No WordPress handler found, using fallback");
        setSubmittedData(data);
        setShowThankYou(true);
        toast({
            title: "Ordine Inviato con Successo!",
        });
    }

    return false;
  }

  return (
    <div className="space-y-8 py-6 relative">
      {/* Custom Toast Notification */}
      {active && (
        <div className="fixed bottom-4 right-4 z-50 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 duration-300">
          {message}
        </div>
      )}

      {/* Thank You Message */}
      {showThankYou && submittedData && (
        <ThankYouMessage
          data={submittedData}
          onStartNew={() => {
            setShowThankYou(false);
            setSubmittedData(null);
            form.reset();
            setStep(1);
          }}
        />
      )}

      {/* Main Form */}
      {!showThankYou && (
        <>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Scheda Clienti</h1>
            <p className="text-muted-foreground">
              Completa il modulo sottostante per effettuare il tuo ordine di mobili.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progresso</span>
              <span className="text-muted-foreground">Passaggio {step} di 2</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-red-500 transition-all duration-300 ease-in-out"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
            return false;
          }}
          className="space-y-8"
        >
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
                  Indietro
                </Button>
                <h2 className="text-2xl font-bold">Scegli i Tuoi Prodotti</h2>
              </div>
              <ProductSelection form={form} />
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 mt-8 py-6 text-lg font-medium"
            size="lg"
          >
            {step === 1 ? "Avanti: Seleziona i Tuoi Prodotti" : "Invia il Tuo Ordine"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

// Thank You Message Component
function ThankYouMessage({
  data,
  onStartNew,
}: {
  data: FormValues;
  onStartNew: () => void;
}) {
  const products = data.products || [];
  const totalItems = products.length;

  // Group products by type
  const groupedProducts = products.reduce((acc, product) => {
    const { type } = product;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-4">
          <CheckCircle className="w-12 h-12 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold text-teal-900">
          Grazie per il tuo ordine!
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Abbiamo ricevuto il tuo ordine con successo. Ti contatteremo al più presto per confermare i dettagli e procedere con la consegna.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-teal-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-teal-900">Riepilogo Ordine</h3>
            <p className="text-sm text-muted-foreground">Conferma dei tuoi prodotti selezionati</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-600">{totalItems}</div>
            <div className="text-xs text-muted-foreground">Articoli</div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-teal-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informazioni Cliente
          </h4>
          <div className="grid gap-2 pl-7">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{data.name}</span>
              {data.email && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {data.email}
                  </span>
                </>
              )}
            </div>
            {data.telephone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                {data.telephone}
              </div>
            )}
            <div className="text-sm text-muted-foreground">{data.city}</div>
          </div>
        </div>

        {/* Products List */}
        {totalItems > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-teal-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Prodotti Selezionati
            </h4>
            <div className="space-y-2 pl-7">
              {Object.entries(groupedProducts).map(([type, items]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{type}</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
                    {items.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {data.additionalNotes && (
          <div className="pt-4 border-t border-teal-200">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> {data.additionalNotes}
            </p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h4 className="font-medium">Prossimi Passi</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Riceverai una email di conferma con i dettagli del tuo ordine</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Il nostro team ti contatterà entro 24-48 ore per confermare l'ordine</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Concorderemo insieme i tempi di consegna e il pagamento</span>
          </li>
        </ul>
      </div>

      {/* Start New Order Button */}
      <div className="text-center">
        <Button
          onClick={onStartNew}
          className="bg-teal-600 hover:bg-teal-700 px-8 py-6 text-lg"
          size="lg"
        >
          Inizia Nuovo Ordine
        </Button>
      </div>
    </div>
  );
}
