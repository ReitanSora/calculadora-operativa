"use client";

import { Solution, SimplexSolution, BigMSolution, TwoPhaseSolution, DualSolution, KnapsackSolution, TransportationSolution, ShortestPathSolution, MaxFlowSolution, MstSolution, MinCostFlowSolution, EOQSolution } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

function isSimplexSolution(sol: any): sol is SimplexSolution {
    return sol && typeof sol === 'object' && 'optimal_value' in sol && 'variable_values' in sol && !('final_tableau' in sol) && !('phase1_iterations' in sol) && !('objective' in sol);
}
function isBigMSolution(sol: any): sol is BigMSolution {
    return sol && typeof sol === 'object' && 'final_tableau' in sol && 'status' in sol;
}
function isTwoPhaseSolution(sol: any): sol is TwoPhaseSolution {
    return sol && typeof sol === 'object' && 'phase1_iterations' in sol && 'phase2_iterations' in sol;
}
function isDualSolution(sol: any): sol is DualSolution {
    return sol && typeof sol === 'object' && 'objective' in sol && 'constraint_coefficients' in sol;
}
function isKnapsackSolution(sol: any): sol is KnapsackSolution {
    return sol && typeof sol === 'object' && 'items_seleccionados' in sol && 'valor_total' in sol;
}
function isTransportationSolution(sol: any): sol is TransportationSolution {
    return sol && typeof sol === 'object' && 'allocation_matrix' in sol && 'total_cost' in sol;
}
function isShortestPathSolution(sol: any): sol is ShortestPathSolution {
    return sol && typeof sol === 'object' && 'path' in sol && 'distance' in sol;
}
function isMaxFlowSolution(sol: any): sol is MaxFlowSolution {
    return sol && typeof sol === 'object' && 'max_flow' in sol && 'interpretation' in sol;
}
function isMstSolution(sol: any): sol is MstSolution {
    return sol && typeof sol === 'object' && 'mst' in sol && 'interpretation' in sol;
}
function isMinCostFlowSolution(sol: any): sol is MinCostFlowSolution {
    return sol && typeof sol === 'object' && 'total_flow' in sol && 'total_cost' in sol;
}

function isEoqSolution(sol: any): sol is EOQSolution {
    return sol && typeof sol === 'object' && ('eoq' in sol);
}

function AIInterpretation({ text }: { text?: string }) {
    if (!text) return null;
    return (
        <Card className="mt-4 border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Interpretation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{text}</p>
            </CardContent>
        </Card>
    );
}


function TableauDisplay({ tableau }: { tableau: number[][] }) {
    if (!tableau || tableau.length === 0) return null;
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {tableau[0].map((_, index) => <TableHead key={index} className="text-center">Col {index + 1}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableau.map((row, i) => (
                        <TableRow key={i}>
                            {row.map((val, j) => (
                                <TableCell key={j} className="text-center font-mono">{val.toFixed(2)}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function renderSolutionValue(sol: Record<string, any>) {
    return Object.entries(sol).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center text-sm p-2 rounded-md even:bg-secondary">
            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="font-mono text-primary">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
        </div>
    ));
};

function SolutionHeader({ title, status, interpretation }: { title: string, status?: string, interpretation?: string }) {
    let badgeVariant: "default" | "destructive" | "secondary" = "default";
    if (status === 'optimal') badgeVariant = 'default';
    if (status === 'infeasible' || status === 'unbounded') badgeVariant = 'destructive';

    return (
        <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" />
                        {title}
                    </CardTitle>
                    {interpretation && <CardDescription className="pt-2">{interpretation}</CardDescription>}
                </div>
                {status && <Badge variant={badgeVariant} className="capitalize">{status}</Badge>}
            </div>
        </CardHeader>
    )
}

export default function SolutionDisplay({ solution }: { solution: Solution }) {
    const { toast } = useToast();

    console.log(solution)

    if (!solution || (solution as any).error) {
        const errorMessage = (solution as any)?.error || "An unexpected error occurred.";
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        );
    }

    if (isSimplexSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Simplex Solution" />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {renderSolutionValue({
                            'Optimal Value': solution.optimal_value,
                            ...solution.variable_values
                        })}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="tableau">
                            <AccordionTrigger>Show Final Tableau</AccordionTrigger>
                            <AccordionContent>
                                <TableauDisplay tableau={solution.tableau} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        );
    }

    if (isBigMSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Big M Solution" status={solution.status} />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {solution.status === 'optimal' && renderSolutionValue({
                            'Optimal Value': solution.optimal_value,
                            ...solution.solution.reduce((acc, val, i) => ({ ...acc, [`X${i + 1}`]: val }), {})
                        })}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="iterations">
                            <AccordionTrigger>Show Iterations ({solution.iterations.length})</AccordionTrigger>
                            <AccordionContent>
                                {solution.iterations.map(iter => (
                                    <div key={iter.iteration} className="mb-4">
                                        <h4 className="font-semibold text-md mb-2">Iteration {iter.iteration}</h4>
                                        <TableauDisplay tableau={iter.tableau} />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        )
    }

    if (isTwoPhaseSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Two-Phase Solution" status={solution.status} />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {solution.status === 'optimal' && renderSolutionValue({
                            'Optimal Value': solution.optimal_value,
                            ...solution.solution.reduce((acc, val, i) => ({ ...acc, [`X${i + 1}`]: val }), {})
                        })}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="iterations">
                            <AccordionTrigger>Show Iterations ({solution.iterations.length})</AccordionTrigger>
                            <AccordionContent>
                                {solution.iterations.map(iter => (
                                    <div key={`${iter.phase}-${iter.iteration}`} className="mb-4 p-2 border-b">
                                        <h4 className="font-semibold text-md mb-2">Phase {iter.phase}, Iteration {iter.iteration}</h4>
                                        <TableauDisplay tableau={iter.tableau} />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        )
    }

    if (isDualSolution(solution)) {
        const dualProblemString = `
Objective: ${solution.objective} Z = ${solution.objective_coefficients.map((c, i) => `${c}y${i + 1}`).join(' + ')}

Subject to:
${solution.constraint_coefficients.map((row, i) =>
            `${row.map((val, j) => `${val}y${j + 1}`).join(' + ')} ${solution.constraint_types[i]} ${solution.constraint_constants[i]}`
        ).join('\n')}
`
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Dual Problem Formulation
                        <Button variant="ghost" size="icon" onClick={() => {
                            navigator.clipboard.writeText(dualProblemString);
                            toast({ title: "Copied!", description: "Dual problem copied to clipboard." });
                        }}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                    <CardDescription>The dual formulation of the problem you provided.</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
                        {dualProblemString}
                    </pre>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        )
    }

    if (isKnapsackSolution(solution)) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Optimal Solution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm p-2 rounded-md even:bg-secondary">
                            <span className="font-medium">Total Value</span>
                            <span className="font-mono text-primary">{solution.valor_total}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 rounded-md even:bg-secondary">
                            <span className="font-medium">Total Weight</span>
                            <span className="font-mono text-primary">{solution.peso_total}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Selected Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solution.items_seleccionados.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell>{item.peso}</TableCell>
                                        <TableCell>{item.valor}</TableCell>
                                        <TableCell>{item.cantidad}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <AIInterpretation text={solution.interpretation_ia} />
            </div>
        );
    }

    if (isTransportationSolution(solution)) {
        const allocationMatrix = solution.allocation_matrix;
        const totalCost = solution.total_cost;

        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Optimal Solution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm p-2 rounded-md even:bg-secondary">
                            <span className="font-medium">Total Cost</span>
                            <span className="font-mono text-primary">{totalCost}</span>
                        </div>
                    </CardContent>
                </Card>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="assignment">
                        <AccordionTrigger>Show Assignment Matrix</AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source</TableHead>
                                            {allocationMatrix && allocationMatrix[0].map((_, j) => (
                                                <TableHead key={j} className="text-center">{`Dest ${j + 1}`}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allocationMatrix && allocationMatrix.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableHead>{`Source ${i + 1}`}</TableHead>
                                                {row.map((val, j) => (
                                                    <TableCell key={j} className="text-center font-mono">{val}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {solution.solucion_basica && (
                        <AccordionItem value="iterations">
                            <AccordionTrigger>Show Iterations (Basic Solution)</AccordionTrigger>
                            <AccordionContent>
                                <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
                                    {JSON.stringify(solution.solucion_basica, null, 2)}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
                <AIInterpretation text={solution.interpretation_ia} />
            </div>
        );
    }

    if (isShortestPathSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Shortest Path" interpretation={solution.interpretation} />
                <CardContent>
                    <div className="flex justify-between items-center text-sm p-2 rounded-md even:bg-secondary">
                        <span className="font-medium">Total Distance</span>
                        <span className="font-mono text-primary">{solution.distance}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 rounded-md even:bg-secondary">
                        <span className="font-medium">Path</span>
                        <span className="font-mono text-primary">{solution.path.join(' -> ')}</span>
                    </div>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        );
    }

    if (isMaxFlowSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Maximum Flow" interpretation={solution.interpretation} />
                <CardContent>
                    {renderSolutionValue({ 'Maximum Flow': solution.max_flow })}
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        );
    }

    if (isMstSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Minimum Spanning Tree" interpretation={solution.interpretation} />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Source</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {solution.mst.map(([u, v, w, c], index) => (
                                <TableRow key={index}>
                                    <TableCell>{u}</TableCell>
                                    <TableCell>{v}</TableCell>
                                    <TableCell>{w}</TableCell>
                                    <TableCell>{c}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        );
    }

    if (isMinCostFlowSolution(solution)) {
        return (
            <Card>
                <SolutionHeader title="Minimum Cost Flow" interpretation={solution.interpretation} />
                <CardContent>
                    <div className="space-y-2">
                        {renderSolutionValue({
                            'Total Flow': solution.total_flow,
                            'Total Cost': solution.total_cost
                        })}
                    </div>
                    <AIInterpretation text={solution.interpretation_ia} />
                </CardContent>
            </Card>
        );
    }


    if (isEoqSolution(solution)) {
        const { interpretation_ia, ...displayValues } = solution;
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" />
                        EOQ Calculation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {renderSolutionValue(displayValues)}
                    </div>
                    <AIInterpretation text={interpretation_ia} />
                </CardContent>
            </Card>
        );
    }


    return (
        <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
            {JSON.stringify(solution, null, 2)}
        </pre>
    );
}
