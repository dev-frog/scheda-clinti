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
      type: "Single",
      senseOfOpening: "Mole",
      additionalNotes: "",
      pose: "No",
      installationType: "Floating",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `mattress-${prev.length + 1}`,
        type: "Single",
        senseOfOpening: "Mole",
        additionalNotes: "",
        pose: "No",
        installationType: "Floating",
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
                <Label htmlFor={`type-${item.id}`}>Type</Label>
                <Select
                  value={item.type}
                  onValueChange={(value) => updateItem(item.id, "type", value)}
                >
                  <SelectTrigger id={`type-${item.id}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Children & Teens">
                      Children & Teens
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Senses of Opening</Label>
                <RadioGroup
                  value={item.senseOfOpening}
                  onValueChange={(value) =>
                    updateItem(item.id, "senseOfOpening", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mole" id={`mole-${item.id}`} />
                    <Label htmlFor={`mole-${item.id}`}>Mole</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Memory" id={`memory-${item.id}`} />
                    <Label htmlFor={`memory-${item.id}`}>Memory</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`additional-notes-${item.id}`}>
                  Additional Notes
                </Label>
                <Textarea
                  id={`additional-notes-${item.id}`}
                  value={item.additionalNotes}
                  onChange={(e) =>
                    updateItem(item.id, "additionalNotes", e.target.value)
                  }
                  placeholder="Enter any additional notes"
                />
              </div>

              <div className="space-y-2">
                <Label>Pose</Label>
                <RadioGroup
                  value={item.pose}
                  onValueChange={(value) => updateItem(item.id, "pose", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id={`pose-yes-${item.id}`} />
                    <Label htmlFor={`pose-yes-${item.id}`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id={`pose-no-${item.id}`} />
                    <Label htmlFor={`pose-no-${item.id}`}>No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Installation Type</Label>
                <RadioGroup
                  value={item.installationType}
                  onValueChange={(value) =>
                    updateItem(item.id, "installationType", value)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Floating"
                      id={`installation-floating-${item.id}`}
                    />
                    <Label htmlFor={`installation-floating-${item.id}`}>
                      Floating
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Glue"
                      id={`installation-glue-${item.id}`}
                    />
                    <Label htmlFor={`installation-glue-${item.id}`}>Glue</Label>
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
        Add Another Mattress
      </Button>
    </div>
  );
}
