"use client";

import type { UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FormValues } from "../scheda-clienti-form";

interface ParquetTechnicalSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function ParquetTechnicalSection({
  form,
}: ParquetTechnicalSectionProps) {
  const products = form.watch("products") || [];

  const addParquetProduct = () => {
    const currentValues = form.getValues();
    const newProduct = {
      type: "Parquet - Sezione Tecnica",
      details: {
        id: uuidv4(),
        productType: currentValues.productType || "",
        surfaceArea: currentValues.surfaceArea || "",
        subfloorCondition: currentValues.subfloorCondition || "",
        installationType: currentValues.installationType || "",
        underlayNeeded: currentValues.underlayNeeded || "",
        skirtingType: currentValues.skirtingType || "",
        skirtingMeters: currentValues.skirtingMeters || "",
        timing: currentValues.timing || "",
      },
    };

    form.setValue("products", [...products, newProduct]);

    // Clear the technical fields
    form.setValue("productType", "");
    form.setValue("surfaceArea", "");
    form.setValue("subfloorCondition", "");
    form.setValue("installationType", "");
    form.setValue("underlayNeeded", "");
    form.setValue("skirtingType", "");
    form.setValue("skirtingMeters", "");
    form.setValue("timing", "");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-teal-600">
          Sezione Tecnica: Parquet
        </h3>
        <p className="text-sm text-muted-foreground">
          Dati specifici per valutare il massetto e le complessità di posa.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="productType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipologia Prodotto Richiesto *</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. Rovere, Teak, prefinito, massello"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specifica il tipo di parquet desiderato
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surfaceArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Superficie Effettiva (mq) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="es. 50"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Metri quadrati totali da coprire
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subfloorCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stato del Fondo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. Massetto cementizio, ceramica preesistente, riscaldamento a pavimento"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Condizioni attuali del sottofondo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="installationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo di Posa Desiderata *</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo di posa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="incollata">Incollata</SelectItem>
                  <SelectItem value="flottante">Flottante</SelectItem>
                  <SelectItem value="flottante_materassino">
                    Flottante con Materassino
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Metodo di installazione preferito
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="underlayNeeded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presenza di Sottofondi</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. necessità di autolivellante"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Eventuali necessità di preparazione sottofondo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="skirtingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Battiscopa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tipologia"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tipo di battiscopa richiesto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skirtingMeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metri Lineari</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="ml"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Quantità in metri
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="timing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tempistiche *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Data prevista per la posa / Entro quando si desidera il completamento"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Indica quando desideri che i lavori siano completati
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addParquetProduct}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Aggiungi Parquet Tecnico
        </Button>
      </div>
    </div>
  );
}