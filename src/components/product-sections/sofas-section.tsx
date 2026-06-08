"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import type { FormValues } from "../scheda-clienti-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SofaItem {
  id: string;
  name: string;
  productCode: string;
  productLink: string;
}

interface SofasSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function SofasSection({ form }: SofasSectionProps) {
  const [items, setItems] = useState<SofaItem[]>([
    {
      id: "sofa-1",
      name: "",
      productCode: "",
      productLink: "",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `sofa-${prev.length + 1}`,
        name: "",
        productCode: "",
        productLink: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof SofaItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    items.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Sofa" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Sofa",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Sofa",
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
                <Label htmlFor={`name-${item.id}`}>Nome</Label>
                <Input
                  id={`name-${item.id}`}
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  placeholder="Inserisci il nome del divano"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`product-code-${item.id}`}>Codice Prodotto</Label>
                <Input
                  id={`product-code-${item.id}`}
                  value={item.productCode}
                  onChange={(e) =>
                    updateItem(item.id, "productCode", e.target.value)
                  }
                  placeholder="Inserisci il codice del prodotto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`product-link-${item.id}`}>Link Prodotto</Label>
                <Input
                  id={`product-link-${item.id}`}
                  value={item.productLink}
                  onChange={(e) =>
                    updateItem(item.id, "productLink", e.target.value)
                  }
                  placeholder="Inserisci il link del prodotto"
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
        Aggiungi un altro Divano
      </Button>
    </div>
  );
}
