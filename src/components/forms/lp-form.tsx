"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Method, Solution } from "@/lib/types";
import { solveLP } from "@/actions/solve";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MinusCircle, Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const lpFormSchema = z.object({
  numVariables: z.number().min(1).max(10),
  numConstraints: z.number().min(1).max(10),
  problemType: z.enum(["max", "min"]),
  objectiveFunction: z.array(z.string().refine(v => v !== '' && !isNaN(parseFloat(v)), "Must be a number")),
  constraints: z.array(z.object({
    row: z.array(z.string().refine(v => v !== '' && !isNaN(parseFloat(v)), "Must be a number")),
    type: z.enum(["<=", ">=", "="]),
    rhs: z.string().refine(v => v !== '' && !isNaN(parseFloat(v)), "Must be a number"),
  }))
});

type LPFormValues = z.infer<typeof lpFormSchema>;

interface LPFormProps {
  setSolution: (solution: Solution) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  method: Method;
}

export default function LPForm({ setSolution, setIsLoading, isLoading, method }: LPFormProps) {
  const [numVariables, setNumVariables] = useState(2);
  const [numConstraints, setNumConstraints] = useState(2);
  const { toast } = useToast();

  const form = useForm<LPFormValues>({
    resolver: zodResolver(lpFormSchema),
    defaultValues: {
      numVariables: 2,
      numConstraints: 2,
      problemType: "max",
      objectiveFunction: Array(2).fill(''),
      constraints: Array(2).fill({}).map(() => ({ row: Array(2).fill(''), type: '<=', rhs: '' }))
    },
  });

  useEffect(() => {
    const currentValues = form.getValues();
    const newConstraints = Array(numConstraints).fill(null).map((_, i) => {
        const oldConstraint = currentValues.constraints[i];
        const newRow = Array(numVariables).fill('');
        if (oldConstraint) {
            for (let j = 0; j < Math.min(numVariables, oldConstraint.row.length); j++) {
                newRow[j] = oldConstraint.row[j];
            }
        }
        return {
            row: newRow,
            type: oldConstraint?.type || '<=',
            rhs: oldConstraint?.rhs || ''
        };
    });

    const newObjective = Array(numVariables).fill('');
    for (let i = 0; i < Math.min(numVariables, currentValues.objectiveFunction.length); i++) {
        newObjective[i] = currentValues.objectiveFunction[i];
    }
    
    form.reset({
      numVariables,
      numConstraints,
      problemType: currentValues.problemType,
      objectiveFunction: newObjective,
      constraints: newConstraints,
    });
  }, [numVariables, numConstraints, form]);


  const onSubmit = async (data: LPFormValues) => {
    setIsLoading(true);
    setSolution(null);
    try {
      const payload = {
        objectiveFunction: data.objectiveFunction.map(Number),
        constraintMatrix: data.constraints.map(c => c.row.map(Number)),
        rightHandSide: data.constraints.map(c => Number(c.rhs)),
        constraintTypes: data.constraints.map(c => c.type),
        problemType: data.problemType,
      };
      
      const result = await solveLP(payload, method as 'simplex' | 'gran-m' | 'dos-fases' | 'dual');
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
                <FormLabel>Variables</FormLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumVariables(v => Math.max(1, v - 1))}><MinusCircle className="h-4 w-4"/></Button>
                    <Input className="text-center" readOnly value={numVariables} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumVariables(v => Math.min(10, v + 1))}><PlusCircle className="h-4 w-4"/></Button>
                </div>
            </FormItem>
            <FormItem>
                <FormLabel>Constraints</FormLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumConstraints(c => Math.max(1, c - 1))}><MinusCircle className="h-4 w-4"/></Button>
                    <Input className="text-center" readOnly value={numConstraints} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setNumConstraints(c => Math.min(10, c + 1))}><PlusCircle className="h-4 w-4"/></Button>
                </div>
            </FormItem>
        </div>

        <div>
          <FormLabel>Objective Function</FormLabel>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <FormField
              control={form.control}
              name="problemType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="max">Max</SelectItem>
                    <SelectItem value="min">Min</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <span className="font-bold text-lg">Z =</span>
            {Array.from({ length: numVariables }).map((_, varIndex) => (
              <div key={varIndex} className="flex items-center gap-2 flex-wrap">
                <FormField
                  control={form.control}
                  name={`objectiveFunction.${varIndex}`}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder={`x${varIndex + 1}`} className="w-20 text-center" />
                  )}
                />
                <span className="font-medium">{`x${varIndex + 1}`}</span>
                {varIndex < numVariables - 1 && <span className="font-medium">+</span>}
              </div>
            ))}
          </div>
          <FormMessage>{(form.formState.errors.objectiveFunction as any)?.message}</FormMessage>
        </div>

        <div>
          <FormLabel>Constraints</FormLabel>
          <div className="overflow-x-auto">
             <Table className="mt-2">
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: numVariables }).map((_, j) => (
                           <TableHead key={j} className="text-center">{`x${j+1}`}</TableHead>
                        ))}
                        <TableHead></TableHead>
                        <TableHead className="text-center">RHS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {Array.from({ length: numConstraints }).map((_, constIndex) => (
                  <TableRow key={constIndex}>
                    {Array.from({ length: numVariables }).map((_, varIndex) => (
                        <TableCell key={varIndex}>
                            <FormField
                            control={form.control}
                            name={`constraints.${constIndex}.row.${varIndex}`}
                            render={({ field }) => (
                                <Input {...field} type="text" className="w-20 text-center mx-auto" placeholder="0" />
                            )}
                            />
                        </TableCell>
                    ))}
                    <TableCell className="text-center">
                        <FormField
                            control={form.control}
                            name={`constraints.${constIndex}.type`}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="<=">&le;</SelectItem>
                                        <SelectItem value=">=">&ge;</SelectItem>
                                        <SelectItem value="=">=</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </TableCell>
                     <TableCell>
                        <FormField
                            control={form.control}
                            name={`constraints.${constIndex}.rhs`}
                            render={({ field }) => (
                                <Input {...field} type="text" className="w-20 text-center mx-auto" placeholder="0" />
                            )}
                        />
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
             </Table>
          </div>
           <FormMessage>{(form.formState.errors.constraints as any)?.message}</FormMessage>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          {isLoading ? "Solving..." : "Solve"}
        </Button>
      </form>
    </Form>
  );
}
