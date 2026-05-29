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

interface DoorItem {
  id: string;
  senseOfOpening: string;
  length: string;
  customLength: string;
  numberOfDoors: string;
  dimensions: string;
  height: string;
  customHeight: string;
  handle: string;
  handleName: string;
  pose: string;
  installationType: string;
}

interface InteriorDoorsSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function InteriorDoorsSection({
  form,
}: InteriorDoorsSectionProps) {
  const [doorItems, setDoorItems] = useState<DoorItem[]>([
    {
      id: "door-1",
      senseOfOpening: "Holy",
      length: "80",
      customLength: "",
      numberOfDoors: "1",
      dimensions: "",
      height: "210",
      customHeight: "",
      handle: "No",
      handleName: "",
      pose: "No",
      installationType: "Floating",
    },
  ]);

  const addDoorItem = () => {
    setDoorItems((prev) => [
      ...prev,
      {
        id: `door-${prev.length + 1}`,
        senseOfOpening: "Holy",
        length: "80",
        customLength: "",
        numberOfDoors: "1",
        dimensions: "",
        height: "210",
        customHeight: "",
        handle: "No",
        handleName: "",
        pose: "No",
        installationType: "Floating",
      },
    ]);
  };

  const removeDoorItem = (id: string) => {
    setDoorItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDoorItem = (id: string, field: keyof DoorItem, value: string) => {
    setDoorItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Update form values
    const products = form.getValues("products") || [];
    const updatedProducts = [...products];

    doorItems.forEach((item) => {
      if (item.id === id) {
        const existingProductIndex = products.findIndex(
          (p) => p.type === "Interior Door" && p.details.id === id
        );

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (existingProductIndex >= 0) {
          updatedProducts[existingProductIndex] = {
            type: "Interior Door",
            details: updatedItem,
          };
        } else {
          updatedProducts.push({
            type: "Interior Door",
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
          Interior Doors ({doorItems.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={addDoorItem}
          size="sm"
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Door
        </Button>
      </div>

      <div className="space-y-6">
        {doorItems.map((item, index) => (
          <Card
            key={item.id}
            className="border border-muted relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-medium rounded-bl-md">
              Door {index + 1}
            </div>
            <CardContent className="pt-8">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>Sense of Opening</Label>
                  <RadioGroup
                    value={item.senseOfOpening}
                    onValueChange={(value) =>
                      updateDoorItem(item.id, "senseOfOpening", value)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Holy" id={`holy-${item.id}`} />
                      <Label htmlFor={`holy-${item.id}`}>Holy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Right" id={`right-${item.id}`} />
                      <Label htmlFor={`right-${item.id}`}>Right</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`length-${item.id}`}>Length</Label>
                    <Select
                      value={item.length}
                      onValueChange={(value) =>
                        updateDoorItem(item.id, "length", value)
                      }
                    >
                      <SelectTrigger id={`length-${item.id}`}>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="70">70</SelectItem>
                        <SelectItem value="80">80</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                        <SelectItem value="Out of Measure">
                          Out of Measure
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.length === "Out of Measure" && (
                    <div className="space-y-2">
                      <Label htmlFor={`custom-length-${item.id}`}>
                        Custom Length
                      </Label>
                      <Input
                        id={`custom-length-${item.id}`}
                        value={item.customLength}
                        onChange={(e) =>
                          updateDoorItem(
                            item.id,
                            "customLength",
                            e.target.value
                          )
                        }
                        placeholder="Enter custom length"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`number-of-doors-${item.id}`}>
                      No. of Doors
                    </Label>
                    <Input
                      id={`number-of-doors-${item.id}`}
                      type="number"
                      min="1"
                      value={item.numberOfDoors}
                      onChange={(e) =>
                        updateDoorItem(item.id, "numberOfDoors", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dimensions-${item.id}`}>
                    Write the Dimensions
                  </Label>
                  <Textarea
                    id={`dimensions-${item.id}`}
                    value={item.dimensions}
                    onChange={(e) =>
                      updateDoorItem(item.id, "dimensions", e.target.value)
                    }
                    placeholder="Enter dimensions details"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`height-${item.id}`}>Height</Label>
                    <Select
                      value={item.height}
                      onValueChange={(value) =>
                        updateDoorItem(item.id, "height", value)
                      }
                    >
                      <SelectTrigger id={`height-${item.id}`}>
                        <SelectValue placeholder="Select height" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="210">210</SelectItem>
                        <SelectItem value="Out of Measure">
                          Out of Measure
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.height === "Out of Measure" && (
                    <div className="space-y-2">
                      <Label htmlFor={`custom-height-${item.id}`}>
                        Custom Height
                      </Label>
                      <Input
                        id={`custom-height-${item.id}`}
                        value={item.customHeight}
                        onChange={(e) =>
                          updateDoorItem(
                            item.id,
                            "customHeight",
                            e.target.value
                          )
                        }
                        placeholder="Enter custom height"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Handle</Label>
                  <RadioGroup
                    value={item.handle}
                    onValueChange={(value) =>
                      updateDoorItem(item.id, "handle", value)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Yes"
                        id={`handle-yes-${item.id}`}
                      />
                      <Label htmlFor={`handle-yes-${item.id}`}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id={`handle-no-${item.id}`} />
                      <Label htmlFor={`handle-no-${item.id}`}>No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {item.handle === "Yes" && (
                  <div className="space-y-2">
                    <Label htmlFor={`handle-name-${item.id}`}>
                      Handle Name
                    </Label>
                    <Input
                      id={`handle-name-${item.id}`}
                      value={item.handleName}
                      onChange={(e) =>
                        updateDoorItem(item.id, "handleName", e.target.value)
                      }
                      placeholder="Enter handle name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Pose</Label>
                  <RadioGroup
                    value={item.pose}
                    onValueChange={(value) =>
                      updateDoorItem(item.id, "pose", value)
                    }
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
                      updateDoorItem(item.id, "installationType", value)
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
                      <Label htmlFor={`installation-glue-${item.id}`}>
                        Glue
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {doorItems.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-6"
                  onClick={() => removeDoorItem(item.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Door
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addDoorItem}
          className="w-full bg-muted/50 hover:bg-muted"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Door
        </Button>
      </div>
    </div>
  );
}
