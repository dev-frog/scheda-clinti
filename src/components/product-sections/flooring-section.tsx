"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import type { FormValues } from "../scheda-clienti-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FlooringItem {
  id: string;
  type: string;
  installationType: string;
}

interface FlooringSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function FlooringSection({ form }: FlooringSectionProps) {
  const [flooringItems, setFlooringItems] = useState<FlooringItem[]>([
    { id: "flooring-1", type: "", installationType: "Flottante" },
  ]);

  const addFlooringItem = () => {
    setFlooringItems((prev) => [
      ...prev,
      {
        id: `flooring-${prev.length + 1}`,
        type: "",
        installationType: "Flottante",
      },
    ]);
  };

  const removeFlooringItem = (id: string) => {
    setFlooringItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateFlooringItem = (
    id: string,
    field: keyof FlooringItem,
    value: string
  ) => {
    setFlooringItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    flooringItems.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Flooring" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Flooring",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Flooring",
            details: updatedItem,
          });
        }
      }
    });

    form.setValue("products", updatedProducts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Pavimentazione ({flooringItems.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={addFlooringItem}
          size="sm"
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Pavimentazione
        </Button>
      </div>

      <div className="space-y-6">
        {flooringItems.map((item, index) => (
          <Card
            key={item.id}
            className="border border-muted relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-medium rounded-bl-md">
              Articolo {index + 1}
            </div>
            <CardContent className="pt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`flooring-type-${item.id}`}>
                    Tipo di Pavimentazione
                  </Label>
                  <Select
                    value={item.type}
                    onValueChange={(value) =>
                      updateFlooringItem(item.id, "type", value)
                    }
                  >
                    <SelectTrigger id={`flooring-type-${item.id}`}>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                                    <SelectContent>
                      <SelectItem value="Massiccio">Massiccio</SelectItem>
                      <SelectItem value="Prefinito">Prefinito</SelectItem>
                      <SelectItem value="Laminato">Laminato</SelectItem>
                      <SelectItem value="SPC">SPC</SelectItem>
                      <SelectItem value="Pavimento da Esterno">
                        Pavimento da Esterno
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo di Installazione</Label>
                  <RadioGroup
                    value={item.installationType}
                    onValueChange={(value) =>
                      updateFlooringItem(item.id, "installationType", value)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Flottante"
                        id={`floating-${item.id}`}
                      />
                      <Label htmlFor={`floating-${item.id}`}>Flottante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Colla" id={`glue-${item.id}`} />
                      <Label htmlFor={`glue-${item.id}`}>Colla</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {flooringItems.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-6"
                  onClick={() => removeFlooringItem(item.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Rimuovi
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addFlooringItem}
          className="w-full bg-muted/50 hover:bg-muted"
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Pavimentazione
        </Button>
      </div>
    </div>
  );
}
