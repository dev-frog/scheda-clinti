"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormValues } from "./scheda-clienti-form";

interface CustomerOnboardingProps {
  form: UseFormReturn<FormValues>;
}

export default function CustomerOnboarding({ form }: CustomerOnboardingProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Anagrafica Cliente
        </h2>
        <p className="text-muted-foreground">
          Dati obbligatori per tutti i prodotti - fondamentali per il CRM e la fatturazione.
        </p>
      </div>

      {/* Customer Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-teal-600 border-b pb-2">
          Informazioni Personali
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome e Cognome / Ragione Sociale *</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci nome completo o ragione sociale" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice Fiscale / Partita IVA *</FormLabel>
                <FormControl>
                  <Input placeholder="Codice fiscale o P.IVA" {...field} />
                </FormControl>
                <FormDescription>
                  Obbligatorio per fatturazione
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cellulare *</FormLabel>
                <FormControl>
                  <Input placeholder="es., +39 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="es., esempio@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Installation Address Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-teal-600 border-b pb-2">
          Indirizzo di Installazione
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="addressStreet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Via/Piazza *</FormLabel>
                <FormControl>
                  <Input placeholder="es., Via Roma, Piazza Duomo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Civico *</FormLabel>
                <FormControl>
                  <Input placeholder="es., 123, 12A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP *</FormLabel>
                <FormControl>
                  <Input placeholder="es., 00100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Città *</FormLabel>
                <FormControl>
                  <Input placeholder="es., Milano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia *</FormLabel>
                <FormControl>
                  <Input placeholder="es., MI, RM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Logistical Site Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-teal-600 border-b pb-2">
          Dettagli Logistici Cantiere
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piano</FormLabel>
                <FormControl>
                  <Input placeholder="es., Piano 1, Piano 2, Terra" {...field} />
                </FormControl>
                <FormDescription>
                  Indicare il piano dell'intervento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stairInternal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scala/Interno</FormLabel>
                <FormControl>
                  <Input placeholder="es., Scala A, Interno 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasElevator"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Presenza Ascensore
                </FormLabel>
                <FormDescription>
                  Seleziona se è presente un ascensore nel palazzo
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accessNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Accesso</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="es: zona ZTL, strada stretta, necessità di gru/piattaforma, orari di accesso, ecc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informazioni importanti per l'accesso al cantiere
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Additional Notes Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-teal-600 border-b pb-2">
          Note Generali
        </h3>

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Aggiuntive (Opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="C'è qualcos'altro che dovremmo sapere?"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Eventuali requisiti speciali o informazioni che potrebbero aiutarci a servirti meglio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
