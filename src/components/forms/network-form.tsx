"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Solution } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Waypoints, Network, Milestone, Trash2, GitCommitHorizontal, LocateFixed, GitBranchPlus, Replace } from "lucide-react";
import { solveShortestPath, solveMaxFlow, solveMst, solveMinCostFlow } from "@/actions/solve";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";


const edgeSchema = z.object({
  source: z.string().min(1, "Required"),
  target: z.string().min(1, "Required"),
  capacity: z.string().refine(v => !isNaN(parseFloat(v)), "Must be a number"),
  cost: z.string().refine(v => !isNaN(parseFloat(v)), "Must be a number"),
});

const networkSchema = z.object({
  edges: z.array(edgeSchema).min(1, "At least one edge is required."),
  startNode: z.string().min(1, "Start node is required."),
  endNode: z.string().min(1, "End node is required."),
});

type NetworkFormValues = z.infer<typeof networkSchema>;

interface NetworkFormProps {
  setSolution: (solution: Solution) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  method: 'shortest-path' | 'max-flow' | 'min-spanning-tree' | 'min-cost-flow';
}


export default function NetworkForm({ setSolution, setIsLoading, isLoading, method }: NetworkFormProps) {
    const { toast } = useToast();
    
    const isMst = method === 'min-spanning-tree';

    const form = useForm<NetworkFormValues>({
        resolver: zodResolver(networkSchema),
        defaultValues: {
            edges: [{ source: 'O', target: 'A', capacity: '2', cost: '2' }],
            startNode: 'O',
            endNode: 'T',
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "edges",
    });

    const onSubmit = async (data: NetworkFormValues) => {
        setIsLoading(true);
        setSolution(null);
        try {
            const edges: [string, string, number, number][] = data.edges.map(e => [
                e.source, e.target, Number(e.capacity), Number(e.cost)
            ]);

            let result;
            switch(method) {
                case 'shortest-path':
                    result = await solveShortestPath({ edges, source: data.startNode, target: data.endNode });
                    break;
                case 'max-flow':
                    result = await solveMaxFlow({ edges, source: data.startNode, target: data.endNode });
                    break;
                case 'min-spanning-tree':
                    result = await solveMst({ edges });
                    break;
                case 'min-cost-flow':
                    result = await solveMinCostFlow({ edges, source: data.startNode, target: data.endNode });
                    break;
            }

            setSolution(result);
            if(result.error) toast({ variant: "destructive", title: "Error", description: result.error });
        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred";
            toast({ variant: "destructive", title: "Submission Error", description: msg });
            setSolution({ error: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const addDefaultEdges = () => {
        const defaultEdges = [
            { source: 'O', target: 'A', capacity: '2', cost: '2' },
            { source: 'A', target: 'O', capacity: '2', cost: '2' },
            { source: 'O', target: 'B', capacity: '5', cost: '5' },
            { source: 'B', target: 'O', capacity: '5', cost: '5' },
            { source: 'O', target: 'C', capacity: '4', cost: '4' },
            { source: 'C', target: 'O', capacity: '4', cost: '4' },
            { source: 'A', target: 'B', capacity: '2', cost: '2' },
            { source: 'B', target: 'A', capacity: '2', cost: '2' },
            { source: 'A', target: 'D', capacity: '7', cost: '7' },
            { source: 'D', target: 'A', capacity: '7', cost: '7' },
            { source: 'B', target: 'D', capacity: '4', cost: '4' },
            { source: 'D', target: 'B', capacity: '4', cost: '4' },
            { source: 'B', target: 'C', capacity: '1', cost: '1' },
            { source: 'C', target: 'B', capacity: '1', cost: '1' },
            { source: 'B', target: 'E', capacity: '3', cost: '3' },
            { source: 'E', target: 'B', capacity: '3', cost: '3' },
            { source: 'C', target: 'E', capacity: '4', cost: '4' },
            { source: 'E', target: 'C', capacity: '4', cost: '4' },
            { source: 'D', target: 'E', capacity: '1', cost: '1' },
            { source: 'E', target: 'D', capacity: '1', cost: '1' },
            { source: 'D', target: 'T', capacity: '5', cost: '5' },
            { source: 'T', target: 'D', capacity: '5', cost: '5' },
            { source: 'E', target: 'T', capacity: '7', cost: '7' },
            { source: 'T', target: 'E', capacity: '7', cost: '7' },
        ];
        replace(defaultEdges);
    }

    const getIcon = () => {
        switch(method) {
            case 'shortest-path': return <Waypoints className="mr-2"/>;
            case 'max-flow': return <Milestone className="mr-2"/>;
            case 'min-spanning-tree': return <GitCommitHorizontal className="mr-2"/>;
            case 'min-cost-flow': return <Network className="mr-2"/>;
        }
    }

    const getButtonText = () => {
         switch(method) {
            case 'shortest-path': return 'Find Shortest Path';
            case 'max-flow': return 'Find Max Flow';
            case 'min-spanning-tree': return 'Find Min Spanning Tree';
            case 'min-cost-flow': return 'Find Min Cost Flow';
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 {!isMst && (
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startNode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><GitBranchPlus /> Source Node</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., O" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="endNode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><LocateFixed /> Target Node</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., T" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                )}
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <FormLabel>Edges (Connections)</FormLabel>
                         <Button type="button" variant="link" size="sm" onClick={addDefaultEdges}>
                            <Replace className="mr-2 h-4 w-4"/>
                            Load Example
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell><FormField control={form.control} name={`edges.${index}.source`} render={({ field }) => <Input {...field}/>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`edges.${index}.target`} render={({ field }) => <Input {...field}/>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`edges.${index}.capacity`} render={({ field }) => <Input {...field}/>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`edges.${index}.cost`} render={({ field }) => <Input {...field}/>} /></TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                 <Button type="button" variant="outline" className="w-full" onClick={() => append({ source: '', target: '', capacity: '0', cost: '0' })}>
                    <PlusCircle className="mr-2" /> Add Edge
                </Button>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {getIcon()}
                    {isLoading ? "Solving..." : getButtonText()}
                </Button>
            </form>
        </Form>
    );
}
