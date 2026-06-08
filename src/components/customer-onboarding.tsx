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
import type { FormValues } from "./scheda-clienti-form";

interface CustomerOnboardingProps {
  form: UseFormReturn<FormValues>;
}

export default function CustomerOnboarding({ form }: CustomerOnboardingProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Cominciamo - Raccontaci di Te
        </h2>
        <p className="text-muted-foreground">
          Per favore fornisci i tuoi dati di contatto in modo da poter elaborare il tuo ordine.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci il tuo nome completo" {...field} />
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
              <FormLabel>Email</FormLabel>
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

        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono</FormLabel>
              <FormControl>
                <Input placeholder="es., +39 123 456 7890" {...field} />
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
              <FormLabel>Città</FormLabel>
              <FormControl>
                <Input placeholder="es., Milano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo Completo</FormLabel>
            <FormControl>
              <Textarea placeholder="Inserisci il tuo indirizzo completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
  );
}
