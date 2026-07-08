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
import ParquetTechnicalSection from "./product-sections/parquet-technical-section";

interface ProductSelectionProps {
  form: UseFormReturn<FormValues>;
}

export default function ProductSelection({ form }: ProductSelectionProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const products = form.watch("products") || [];

  const toggleSection = (value: string) => {
    setExpandedSections((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-muted-foreground">
          Seleziona i prodotti che desideri ordinare. Aggiungine quanti ne vuoi!
        </p>

        {/* Mobile order count indicator */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg self-start">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium">{products.length} Articoli</span>
        </div>
      </div>

      {/* 50/50 Layout: Products on left, Summary on right */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left: Product Accordion */}
        <div className="space-y-4 min-h-0">
          <Accordion type="multiple" value={expandedSections} className="w-full">
        <AccordionItem
          value="parquetTechnical"
          className="border rounded-lg mb-4 overflow-hidden bg-gradient-to-r from-teal-50 to-white"
        >
          <AccordionTrigger
            onClick={() => toggleSection("parquetTechnical")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-teal-700">🔧 Sezione Tecnica: Parquet</span>
                <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">Dettagli</span>
              </div>
            </div>
            {expandedSections.includes("parquetTechnical") ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6 border-t">
            <ParquetTechnicalSection form={form} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="flooring"
          className="border rounded-lg mb-4 overflow-hidden"
        >
          <AccordionTrigger
            onClick={() => toggleSection("flooring")}
            className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50"
          >
            <div className="flex items-center text-left">
              <span className="text-lg font-medium">Pacchetto (Pavimentazione)</span>
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
              <span className="text-lg font-medium">Porte Interne</span>
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
              <span className="text-lg font-medium">Porta Blindata</span>
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
              <span className="text-lg font-medium">Arredo Bagno</span>
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
              <span className="text-lg font-medium">Infissi</span>
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
              <span className="text-lg font-medium">Materassi</span>
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
              <span className="text-lg font-medium">Ceramiche</span>
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
              <span className="text-lg font-medium">Divani</span>
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
                Camerette
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
        </div>

        {/* Right: Sticky Order Summary */}
        <div className="md:sticky md:top-6 h-fit md:self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Card className="border-2 border-teal-100 bg-gradient-to-br from-white to-teal-50/30 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-900">Riepilogo Ordine</h3>
                  <p className="text-sm text-muted-foreground">I tuoi prodotti selezionati</p>
                </div>
              </div>
              <OrderSummary form={form} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ form }: { form: UseFormReturn<FormValues> }) {
  const products = form.watch("products") || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 1H5l1-1z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">
          Nessun prodotto selezionato. Espandi le categorie per aggiungere prodotti.
        </p>
      </div>
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
    <div className="space-y-4">
      {/* Total count badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-500 text-white rounded-lg">
        <span className="font-medium">Totale Articoli</span>
        <span className="font-bold text-xl">{products.length}</span>
      </div>

      {Object.entries(groupedProducts).map(([type, items]) => (
        <div key={type} className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-teal-100 text-teal-800 rounded-lg font-medium text-sm">
            <span>{type}</span>
            <span className="bg-teal-500 text-white px-2 py-0.5 rounded-full text-xs">
              {items.length}
            </span>
          </div>
          <div className="space-y-2 pl-2">
            {items.map((product, index) => (
              <div key={index} className="bg-white border border-teal-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {product.details.id}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  {Object.entries(product.details)
                    .filter(([key]) => key !== "id")
                    .slice(0, 3) // Show only first 3 details to keep it compact
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-muted-foreground text-xs capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="font-medium text-xs text-right truncate max-w-[120px]">
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
