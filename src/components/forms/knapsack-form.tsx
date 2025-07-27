"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Solution } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MinusCircle, Backpack, Trash2 } from "lucide-react";
import { solveKnapsack } from "@/actions/solve";
import { Card } from "../ui/card";

const knapsackFormSchema = z.object({
  capacity: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be a positive number"),
  items: z.array(z.object({
    weight: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a non-negative number"),
    value: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a non-negative number"),
  })).min(1, "At least one item is required"),
});

type KnapsackFormValues = z.infer<typeof knapsackFormSchema>;

interface KnapsackFormProps {
  setSolution: (solution: Solution) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export default function KnapsackForm({ setSolution, setIsLoading, isLoading }: KnapsackFormProps) {
  const { toast } = useToast();

  const form = useForm<KnapsackFormValues>({
    resolver: zodResolver(knapsackFormSchema),
    defaultValues: {
      capacity: '',
      items: [{ weight: '', value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: KnapsackFormValues) => {
    setIsLoading(true);
    setSolution(null);
    try {
      const payload = {
        capacity: Number(data.capacity),
        weights: data.items.map(item => Number(item.weight)),
        values: data.items.map(item => Number(item.value)),
      };
      
      const result = await solveKnapsack(payload);
      // The backend response for knapsack was different than initially implemented.
      // We will re-map it here to a more display-friendly format.
      if (result.maximum_value !== undefined && result.quantities && result.selected_items_indices) {
          let totalWeight = 0;
          const selectedItems = result.quantities.map((quantity: number, index: number) => {
              if (quantity > 0) {
                  const weight = payload.weights[index];
                  const value = payload.values[index];
                  totalWeight += weight * quantity;
                  return {
                      item: index + 1,
                      peso: weight,
                      valor: value,
                      cantidad: quantity,
                  }
              }
              return null;
          }).filter(Boolean);

          const solution = {
              valor_total: result.maximum_value,
              peso_total: totalWeight,
              items_seleccionados: selectedItems
          };
          setSolution(solution);

      } else {
        setSolution(result);
        if(result.error) {
          toast({
              variant: "destructive",
              title: "Error",
              description: result.error,
          });
        }
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
        <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Knapsack Capacity</FormLabel>
                    <FormControl>
                        <Input {...field} type="text" placeholder="e.g., 50" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="space-y-4">
            <FormLabel>Items</FormLabel>
            {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`items.${index}.weight`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={`Item ${index + 1} Weight`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={`Item ${index + 1} Value`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {fields.length > 1 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </Card>
            ))}
             <FormMessage>{form.formState.errors.items?.message}</FormMessage>
        </div>

        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ weight: '', value: '' })}
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>


        <Button type="submit" disabled={isLoading} className="w-full">
          <Backpack className="mr-2 h-4 w-4" />
          {isLoading ? "Solving..." : "Solve"}
        </Button>
      </form>
    </Form>
  );
}