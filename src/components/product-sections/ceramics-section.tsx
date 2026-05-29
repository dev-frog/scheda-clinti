"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import type { FormValues } from "../scheda-clienti-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CeramicItem {
  id: string;
  squareMeters: string;
  note: string;
}

interface CeramicsSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function CeramicsSection({ form }: CeramicsSectionProps) {
  const [items, setItems] = useState<CeramicItem[]>([
    {
      id: "ceramic-1",
      squareMeters: "",
      note: "",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `ceramic-${prev.length + 1}`,
        squareMeters: "",
        note: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CeramicItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    items.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Ceramic" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Ceramic",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Ceramic",
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
                <Label htmlFor={`square-meters-${item.id}`}>
                  Desired Square Meters
                </Label>
                <Input
                  id={`square-meters-${item.id}`}
                  type="number"
                  min="0"
                  value={item.squareMeters}
                  onChange={(e) =>
                    updateItem(item.id, "squareMeters", e.target.value)
                  }
                  placeholder="Enter desired square meters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`note-${item.id}`}>Note (Name/Code/Link)</Label>
                <Textarea
                  id={`note-${item.id}`}
                  value={item.note}
                  onChange={(e) => updateItem(item.id, "note", e.target.value)}
                  placeholder="Enter product name, code, or link"
                />
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
                Remove
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
        Add Another Ceramic
      </Button>
    </div>
  );
}
