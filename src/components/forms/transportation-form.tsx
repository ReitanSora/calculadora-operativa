"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Solution } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MinusCircle, Truck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { solveTransportation } from "@/actions/solve";

const transportFormSchema = z.object({
  numSources: z.number().min(1).max(10),
  numDestinations: z.number().min(1).max(10),
  supply: z.array(z.string().refine(v => !isNaN(parseFloat(v)), "Must be a number")),
  demand: z.array(z.string().refine(v => !isNaN(parseFloat(v)), "Must be a number")),
  costs: z.array(z.array(z.string().refine(v => !isNaN(parseFloat(v)), "Must be a number"))),
});

type TransportFormValues = z.infer<typeof transportFormSchema>;

interface TransportationFormProps {
  setSolution: (solution: Solution) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  method: 'transporte-minimo' | 'transporte-noroeste' | 'transporte-vogel';
}

export default function TransportationForm({ setSolution, setIsLoading, isLoading, method }: TransportationFormProps) {
  const [numSources, setNumSources] = useState(2);
  const [numDestinations, setNumDestinations] = useState(3);
  const { toast } = useToast();

  const form = useForm<TransportFormValues>({
    resolver: zodResolver(transportFormSchema),
    defaultValues: {
      numSources: 2,
      numDestinations: 3,
      supply: Array(2).fill(''),
      demand: Array(3).fill(''),
      costs: Array(2).fill(Array(3).fill('')),
    },
  });

  useEffect(() => {
    form.setValue("numSources", numSources);
    form.setValue("numDestinations", numDestinations);
    const currentValues = form.getValues();
    const newSupply = Array(numSources).fill('');
    const newDemand = Array(numDestinations).fill('');
    const newCosts = Array(numSources).fill(0).map(() => Array(numDestinations).fill(''));

    // Preserve existing values
    for (let i = 0; i < Math.min(numSources, currentValues.supply.length); i++) {
        newSupply[i] = currentValues.supply[i] || '';
    }
     for (let i = 0; i < Math.min(numDestinations, currentValues.demand.length); i++) {
        newDemand[i] = currentValues.demand[i] || '';
    }
    for (let i = 0; i < Math.min(numSources, currentValues.costs.length); i++) {
        for (let j = 0; j < Math.min(numDestinations, currentValues.costs[i].length); j++) {
            newCosts[i][j] = currentValues.costs[i][j] || '';
        }
    }

    form.setValue("supply", newSupply);
    form.setValue("demand", newDemand);
    form.setValue("costs", newCosts);
  }, [numSources, numDestinations, form]);


  const onSubmit = async (data: TransportFormValues) => {
    setIsLoading(true);
    setSolution(null);
    try {
        const supplySum = data.supply.map(Number).reduce((a, b) => a + b, 0);
        const demandSum = data.demand.map(Number).reduce((a, b) => a + b, 0);
        if (supplySum !== demandSum) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: `Total Supply (${supplySum}) must equal Total Demand (${demandSum}). Please adjust values.`,
            });
            setIsLoading(false);
            return;
        }

      const payload = {
        supply: data.supply.map(Number),
        demand: data.demand.map(Number),
        costs: data.costs.map(row => row.map(Number)),
      };
      
      const result = await solveTransportation(payload, method);
      setSolution(result);
      if(result.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: errorMessage,
        });
        setSolution({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <FormItem>
                <FormLabel>Sources (Oferta)</FormLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumSources(v => Math.max(1, v - 1))}><MinusCircle className="h-4 w-4"/></Button>
                    <Input className="text-center" readOnly value={numSources} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumSources(v => Math.min(10, v + 1))}><PlusCircle className="h-4 w-4"/></Button>
                </div>
            </FormItem>
            <FormItem>
                <FormLabel>Destinations (Demanda)</FormLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumDestinations(c => Math.max(1, c - 1))}><MinusCircle className="h-4 w-4"/></Button>
                    <Input className="text-center" readOnly value={numDestinations} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumDestinations(c => Math.min(10, c + 1))}><PlusCircle className="h-4 w-4"/></Button>
                </div>
            </FormItem>
        </div>

        <div>
          <FormLabel>Cost Matrix, Supply, and Demand</FormLabel>
          <div className="overflow-x-auto">
             <Table className="mt-2">
                <TableHeader>
                    <TableRow>
                        <TableHead>Source</TableHead>
                        {Array.from({ length: numDestinations }).map((_, j) => (
                           <TableHead key={j} className="text-center">{`Dest ${j+1}`}</TableHead>
                        ))}
                        <TableHead className="text-center">Supply</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {Array.from({ length: numSources }).map((_, i) => (
                  <TableRow key={i}>
                    <TableHead>{`Source ${i+1}`}</TableHead>
                    {Array.from({ length: numDestinations }).map((_, j) => (
                        <TableCell key={j}>
                            <FormField
                            control={form.control}
                            name={`costs.${i}.${j}`}
                            render={({ field }) => (
                                <Input {...field} type="text" className="w-20 text-center mx-auto" placeholder="Cost" />
                            )}
                            />
                        </TableCell>
                    ))}
                     <TableCell>
                        <FormField
                            control={form.control}
                            name={`supply.${i}`}
                            render={({ field }) => (
                                <Input {...field} type="text" className="w-20 text-center mx-auto bg-primary/10" placeholder="Supply" />
                            )}
                        />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                    <TableHead>Demand</TableHead>
                     {Array.from({ length: numDestinations }).map((_, j) => (
                        <TableCell key={j}>
                             <FormField
                                control={form.control}
                                name={`demand.${j}`}
                                render={({ field }) => (
                                    <Input {...field} type="text" className="w-20 text-center mx-auto bg-primary/10" placeholder="Demand" />
                                )}
                            />
                        </TableCell>
                     ))}
                     <TableCell className="bg-muted"></TableCell>
                </TableRow>
                </TableBody>
             </Table>
          </div>
           <FormMessage>{form.formState.errors.costs?.message || form.formState.errors.supply?.message || form.formState.errors.demand?.message}</FormMessage>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          <Truck className="mr-2 h-4 w-4" />
          {isLoading ? "Solving..." : "Solve"}
        </Button>
      </form>
    </Form>
  );
}
