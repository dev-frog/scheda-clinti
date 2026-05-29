"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus, Minus } from "lucide-react";

import type { FormValues } from "./scheda-clienti-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import FlooringSection from "./product-sections/flooring-section";
import InteriorDoorsSection from "./product-sections/interior-doors-section";
import ArmoredDoorSection from "./product-sections/armored-door-section";
import BathroomFurnitureSection from "./product-sections/bathroom-furniture-section";
import FixturesSection from "./product-sections/fixtures-section";
import MattressesSection from "./product-sections/mattresses-section";
import CeramicsSection from "./product-sections/ceramics-section";
import SofasSection from "./product-sections/sofas-section";
import ChildrenBedroomsSection from "./product-sections/children-bedrooms-section";

interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
}

export default function ProductSelection({ form }: ProductSelectionProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (value: string) => {
    setExpandedSections((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <p className="text-muted-foreground">
        Select the products you&apos;d like to order. Add as many as you need!
      </p>

      <Accordion type="multiple" value={expandedSections} className="w-full">
        <AccordionItem
          value="flooring"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("flooring")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Package (Flooring)</span>
            </div>
            {expandedSections.includes("flooring") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <FlooringSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="interiorDoors"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("interiorDoors")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Interior Doors</span>
            </div>
            {expandedSections.includes("interiorDoors") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <InteriorDoorsSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="armoredDoor"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("armoredDoor")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Armored Door</span>
            </div>
            {expandedSections.includes("armoredDoor") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <ArmoredDoorSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="bathroomFurniture"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("bathroomFurniture")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Bathroom Furniture</span>
            </div>
            {expandedSections.includes("bathroomFurniture") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <BathroomFurnitureSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="fixtures"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("fixtures")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Fixtures</span>
            </div>
            {expandedSections.includes("fixtures") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <FixturesSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="mattresses"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("mattresses")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Mattresses</span>
            </div>
            {expandedSections.includes("mattresses") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <MattressesSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="ceramics"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("ceramics")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Ceramics</span>
            </div>
            {expandedSections.includes("ceramics") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <CeramicsSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="sofas"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("sofas")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Sofas</span>
            </div>
            {expandedSections.includes("sofas") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <SofasSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="childrenBedrooms"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("childrenBedrooms")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">
                Children&apos;s Bedrooms
              </span>
            </div>
            {expandedSections.includes("childrenBedrooms") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <ChildrenBedroomsSection form={form} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <OrderSummary form={form} />
        </CardContent>
      </Card>
    </div>
  );
}

function OrderSummary({ form }: { form: UseFormReturn<FormValues> }) {
  const products = form.watch("products") || [];

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground">
        No products selected yet. Expand the categories above to add products.
      </p>
    );
  }

  // Group products by type
  const groupedProducts = products.reduce((acc, product) => {
    const { type } = product;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedProducts).map(([type, items]) => (
        <div key={type} className="space-y-3">
          <h4 className="font-medium text-lg border-b pb-2">
            {type} ({items.length})
          </h4>
          <div className="grid gap-3">
            {items.map((product, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">Item {index + 1}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {product.details.id}
                  </span>
                </div>
                <div className="text-sm mt-2 grid gap-1">
                  {Object.entries(product.details)
                    .filter(([key]) => key !== "id")
                    .map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                        </span>
                        <span className="truncate">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : value?.toString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
