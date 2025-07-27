"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Solution } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { solveEoq } from "@/actions/solve";

const numberField = z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Must be a non-negative number");

const eoqSchema = z.object({
  weeklyDemand: numberField,
  workingDays: numberField,
  orderingCost: numberField,
  holdingCost: numberField,
  leadTime: numberField,
});

interface InventoryFormProps {
  setSolution: (solution: Solution) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export default function InventoryForm({ setSolution, setIsLoading, isLoading }: InventoryFormProps) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof eoqSchema>>({
        resolver: zodResolver(eoqSchema),
        defaultValues: {
            weeklyDemand: '200',
            workingDays: '360',
            orderingCost: '30',
            holdingCost: '5',
            leadTime: '1',
        }
    });

    const onSubmit = async (data: z.infer<typeof eoqSchema>) => {
        setIsLoading(true);
        setSolution(null);
        try {
            const payload = {
                weeklyDemand: Number(data.weeklyDemand),
                workingDays: Number(data.workingDays),
                orderingCost: Number(data.orderingCost),
                holdingCost: Number(data.holdingCost),
                leadTime: Number(data.leadTime),
            };
            const result = await solveEoq(payload);
            if (result.error) {
              toast({ variant: "destructive", title: "Error", description: result.error });
            }
            setSolution(result);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred";
            toast({ variant: "destructive", title: "Submission Error", description: msg });
            setSolution({ error: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="weeklyDemand" render={({ field }) => (
                    <FormItem><FormLabel>Weekly Demand</FormLabel><FormControl><Input {...field} placeholder="e.g., 200" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="workingDays" render={({ field }) => (
                    <FormItem><FormLabel>Working Days per Year</FormLabel><FormControl><Input {...field} placeholder="e.g., 360" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="orderingCost" render={({ field }) => (
                    <FormItem><FormLabel>Ordering Cost per Order</FormLabel><FormControl><Input {...field} placeholder="e.g., 30" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="holdingCost" render={({ field }) => (
                    <FormItem><FormLabel>Holding Cost per Unit per Year</FormLabel><FormControl><Input {...field} placeholder="e.g., 5" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="leadTime" render={({ field }) => (
                    <FormItem><FormLabel>Lead Time (days)</FormLabel><FormControl><Input {...field} placeholder="e.g., 1" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="w-full !mt-6">
                    <Package className="mr-2"/>
                    {isLoading ? "Calculating..." : "Calculate EOQ"}
                </Button>
            </form>
        </Form>
    );
}
