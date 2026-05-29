"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import type { FormValues } from "../scheda-clienti-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface BathroomFurnitureItem {
  id: string;
  name: string;
  productCode: string;
  productLink: string;
  transport: string;
}

interface BathroomFurnitureSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function BathroomFurnitureSection({
  form,
}: BathroomFurnitureSectionProps) {
  const [items, setItems] = useState<BathroomFurnitureItem[]>([
    {
      id: "bathroom-1",
      name: "",
      productCode: "",
      productLink: "",
      transport: "No",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `bathroom-${prev.length + 1}`,
        name: "",
        productCode: "",
        productLink: "",
        transport: "No",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof BathroomFurnitureItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    items.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Bathroom Furniture" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Bathroom Furniture",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Bathroom Furniture",
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
          Bathroom Furniture ({items.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          size="sm"
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="border border-muted relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-medium rounded-bl-md">
              Item {index + 1}
            </div>
            <CardContent className="pt-8">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`name-${item.id}`}>Name</Label>
                  <Input
                    id={`name-${item.id}`}
                    value={item.name}
                    onChange={(e) =>
                      updateItem(item.id, "name", e.target.value)
                    }
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`product-code-${item.id}`}>
                    Product Code
                  </Label>
                  <Input
                    id={`product-code-${item.id}`}
                    value={item.productCode}
                    onChange={(e) =>
                      updateItem(item.id, "productCode", e.target.value)
                    }
                    placeholder="Enter product code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`product-link-${item.id}`}>
                    Product Link
                  </Label>
                  <Input
                    id={`product-link-${item.id}`}
                    value={item.productLink}
                    onChange={(e) =>
                      updateItem(item.id, "productLink", e.target.value)
                    }
                    placeholder="Enter product link"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transport</Label>
                  <RadioGroup
                    value={item.transport}
                    onValueChange={(value) =>
                      updateItem(item.id, "transport", value)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Yes"
                        id={`transport-yes-${item.id}`}
                      />
                      <Label htmlFor={`transport-yes-${item.id}`}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="No"
                        id={`transport-no-${item.id}`}
                      />
                      <Label htmlFor={`transport-no-${item.id}`}>No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {items.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-6"
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
          className="w-full bg-muted/50 hover:bg-muted"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Item
        </Button>
      </div>
    </div>
  );
}
