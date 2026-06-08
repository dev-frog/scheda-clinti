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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface FixtureItem {
  id: string;
  material: string;
  numberOfWindows: string;
  numberOfDoors: string;
  interiorColor: string;
  exteriorColor: string;
  notes: string;
  extras: string[];
  pose: string;
}

interface FixturesSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function FixturesSection({ form }: FixturesSectionProps) {
  const [items, setItems] = useState<FixtureItem[]>([
    {
      id: "fixture-1",
      material: "Wood",
      numberOfWindows: "1",
      numberOfDoors: "1",
      interiorColor: "",
      exteriorColor: "",
      notes: "",
      extras: [],
      pose: "No",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `fixture-${prev.length + 1}`,
        material: "Wood",
        numberOfWindows: "1",
        numberOfDoors: "1",
        interiorColor: "",
        exteriorColor: "",
        notes: "",
        extras: [],
        pose: "No",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof FixtureItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    items.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Fixtures" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Fixtures",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Fixtures",
            details: updatedItem,
          });
        }
      }
    });

    form.setValue("products", updatedProducts);
  };

  const toggleExtra = (id: string, extra: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const extras = [...item.extras];
    const index = extras.indexOf(extra);

    if (index > -1) {
      extras.splice(index, 1);
    } else {
      extras.push(extra);
    }

    updateItem(id, "extras", extras);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border border-muted">
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`material-${item.id}`}>Materiale</Label>
                <Select
                  value={item.material}
                  onValueChange={(value) =>
                    updateItem(item.id, "material", value)
                  }
                >
                  <SelectTrigger id={`material-${item.id}`}>
                    <SelectValue placeholder="Seleziona materiale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wood">Legno</SelectItem>
                    <SelectItem value="PVC">PVC</SelectItem>
                    <SelectItem value="Aluminum">Alluminio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`number-of-windows-${item.id}`}>
                    N. di Finestre
                  </Label>
                  <Input
                    id={`number-of-windows-${item.id}`}
                    type="number"
                    min="0"
                    value={item.numberOfWindows}
                    onChange={(e) =>
                      updateItem(item.id, "numberOfWindows", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`number-of-doors-${item.id}`}>
                    N. di Porte
                  </Label>
                  <Input
                    id={`number-of-doors-${item.id}`}
                    type="number"
                    min="0"
                    value={item.numberOfDoors}
                    onChange={(e) =>
                      updateItem(item.id, "numberOfDoors", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`interior-color-${item.id}`}>
                    Colore Interno
                  </Label>
                  <Input
                    id={`interior-color-${item.id}`}
                    value={item.interiorColor}
                    onChange={(e) =>
                      updateItem(item.id, "interiorColor", e.target.value)
                    }
                    placeholder="Inserisci il colore interno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`exterior-color-${item.id}`}>
                    Colore Esterno
                  </Label>
                  <Input
                    id={`exterior-color-${item.id}`}
                    value={item.exteriorColor}
                    onChange={(e) =>
                      updateItem(item.id, "exteriorColor", e.target.value)
                    }
                    placeholder="Inserisci il colore esterno"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`notes-${item.id}`}>Note (Misure)</Label>
                <Textarea
                  id={`notes-${item.id}`}
                  value={item.notes}
                  onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                  placeholder="Inserisci le misure e altre note"
                />
              </div>

              <div className="space-y-2">
                <Label>Extra</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`shutters-${item.id}`}
                      checked={item.extras.includes("Shutters")}
                      onCheckedChange={() => toggleExtra(item.id, "Shutters")}
                    />
                    <Label htmlFor={`shutters-${item.id}`}>Persiane</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`blinds-${item.id}`}
                      checked={item.extras.includes("Blinds")}
                      onCheckedChange={() => toggleExtra(item.id, "Blinds")}
                    />
                    <Label htmlFor={`blinds-${item.id}`}>Tapparelle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`mosquito-nets-${item.id}`}
                      checked={item.extras.includes("Mosquito Nets")}
                      onCheckedChange={() =>
                        toggleExtra(item.id, "Mosquito Nets")
                      }
                    />
                    <Label htmlFor={`mosquito-nets-${item.id}`}>
                      Zanzariere
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Posa</Label>
                <RadioGroup
                  value={item.pose}
                  onValueChange={(value) => updateItem(item.id, "pose", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id={`pose-yes-${item.id}`} />
                    <Label htmlFor={`pose-yes-${item.id}`}>Sì</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id={`pose-no-${item.id}`} />
                    <Label htmlFor={`pose-no-${item.id}`}>No</Label>
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
        Aggiungi un altro Infisso
      </Button>
    </div>
  );
}
