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
import { Textarea } from "@/components/ui/textarea";

interface MattressItem {
  id: string;
  type: string;
  senseOfOpening: string;
  additionalNotes: string;
  pose: string;
  installationType: string;
}

interface MattressesSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function MattressesSection({ form }: MattressesSectionProps) {
  const [items, setItems] = useState<MattressItem[]>([
    {
      id: "mattress-1",
      type: "Singolo",
      senseOfOpening: "Molle",
      additionalNotes: "",
      pose: "No",
      installationType: "Flottante",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `mattress-${prev.length + 1}`,
        type: "Singolo",
        senseOfOpening: "Molle",
        additionalNotes: "",
        pose: "No",
        installationType: "Flottante",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof MattressItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    items.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Mattress" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Mattress",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Mattress",
            details: updatedItem,
          });
        }
      }
    });

    form.setValue("products", updatedProducts);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border border-muted">
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`type-${item.id}`}>Tipo</Label>
                <Select
                  value={item.type}
                  onValueChange={(value) => updateItem(item.id, "type", value)}
                >
                  <SelectTrigger id={`type-${item.id}`}>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Singolo">Singolo</SelectItem>
                    <SelectItem value="Matrimoniale">Matrimoniale</SelectItem>
                    <SelectItem value="Bambini e Ragazzi">
                      Bambini e Ragazzi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipologia</Label>
                <RadioGroup
                  value={item.senseOfOpening}
                  onValueChange={(value) =>
                    updateItem(item.id, "senseOfOpening", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mole" id={`mole-${item.id}`} />
                    <Label htmlFor={`mole-${item.id}`}>Molle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Memory" id={`memory-${item.id}`} />
                    <Label htmlFor={`memory-${item.id}`}>Memory</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`additional-notes-${item.id}`}>
                  Note Aggiuntive
                </Label>
                <Textarea
                  id={`additional-notes-${item.id}`}
                  value={item.additionalNotes}
                  onChange={(e) =>
                    updateItem(item.id, "additionalNotes", e.target.value)
                  }
                  placeholder="Inserisci eventuali note aggiuntive"
                />
              </div>

              <div className="space-y-2">
                <Label>Posa</Label>
                <RadioGroup
                  value={item.pose}
                  onValueChange={(value) => updateItem(item.id, "pose", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sì" id={`pose-yes-${item.id}`} />
                    <Label htmlFor={`pose-yes-${item.id}`}>Sì</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id={`pose-no-${item.id}`} />
                    <Label htmlFor={`pose-no-${item.id}`}>No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tipo di Installazione</Label>
                <RadioGroup
                  value={item.installationType}
                  onValueChange={(value) =>
                    updateItem(item.id, "installationType", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Flottante"
                      id={`installation-floating-${item.id}`}
                    />
                    <Label htmlFor={`installation-floating-${item.id}`}>
                      Flottante
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Colla"
                      id={`installation-glue-${item.id}`}
                    />
                    <Label htmlFor={`installation-glue-${item.id}`}>Colla</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {items.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => removeItem(item.id)}
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
        onClick={addItem}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Aggiungi un altro Materasso
      </Button>
    </div>
  );
}
