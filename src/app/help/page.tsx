import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Code2 } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Guides and examples for the different operational research models supported by OptiSolve.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full mt-8">
        <AccordionItem value="item-1">
          <AccordionTrigger>Linear Programming (Simplex, Big M, Two-Phase)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p>
              These methods solve linear programming problems. You need to provide an objective function to maximize or minimize, subject to a set of linear constraints.
            </p>
            <p><strong>Inputs:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
                <li><strong>Variables/Constraints:</strong> Set the number of decision variables and constraints.</li>
                <li><strong>Objective Function:</strong> The coefficients of the variables you want to optimize.</li>
                <li><strong>Constraints:</strong> The matrix of coefficients for the constraints and their right-hand side (RHS) values. Currently, only '&le;' constraints are supported by the UI for simplicity.</li>
            </ul>
             <p className="font-semibold pt-2">Example JSON Payload:</p>
            <Card>
                <CardContent className="p-0">
                    <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
                        <code className="text-secondary-foreground">{`{
  "funcion_objetivo": [5, 4],
  "restricciones": [
    [6, 4],
    [1, 2]
  ],
  "lados_derechos": [24, 6],
  "tipo_problema": "max"
}`}
                        </code>
                    </pre>
                </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Transportation</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p>
              The transportation model finds the most cost-effective way to ship goods from a set of sources to a set of destinations. Total supply must equal total demand.
            </p>
            <p><strong>Inputs:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
                <li><strong>Sources/Destinations:</strong> Set the number of supply sources and demand destinations.</li>
                <li><strong>Cost Matrix:</strong> The cost to ship one unit from each source to each destination.</li>
                <li><strong>Supply:</strong> The amount available at each source.</li>
                <li><strong>Demand:</strong> The amount required at each destination.</li>
            </ul>
            <p className="font-semibold pt-2">Example JSON Payload:</p>
            <Card>
                <CardContent className="p-0">
                    <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
                        <code className="text-secondary-foreground">{`{
  "costos": [
    [10, 2, 20],
    [1, 12, 8]
  ],
  "oferta": [15, 25],
  "demanda": [5, 15, 20]
}`}
                        </code>
                    </pre>
                </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Knapsack (Dynamic Programming)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p>
              The knapsack problem selects a combination of items, each with a specific weight and value, to maximize total value without exceeding a given weight capacity.
            </p>
            <p><strong>Inputs:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
                <li><strong>Capacity:</strong> The maximum weight the knapsack can hold.</li>
                <li><strong>Items:</strong> A list of items, each with its own weight and value.</li>
            </ul>
             <p className="font-semibold pt-2">Example JSON Payload:</p>
            <Card>
                <CardContent className="p-0">
                    <pre className="p-4 bg-secondary rounded-md overflow-x-auto text-sm">
                        <code className="text-secondary-foreground">{`{
  "pesos": [10, 20, 30],
  "valores": [60, 100, 120],
  "capacidad": 50
}`}
                        </code>
                    </pre>
                </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="item-4">
          <AccordionTrigger>Networks (Dijkstra, Max Flow, PERT)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p>Solves various network optimization problems.</p>
            <p><strong>Dijkstra:</strong> Finds the shortest path from a start node to all other nodes in a weighted graph. Requires an adjacency matrix and a starting node index.</p>
            <p><strong>Max Flow:</strong> Determines the maximum flow from a source to a sink in a flow network. Requires a capacity graph, a source node index, and a sink node index.</p>
            <p><strong>PERT:</strong> Analyzes project timelines by finding the critical path. Requires a list of activities with predecessors and optimistic, normal, and pessimistic time estimates.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="item-5">
          <AccordionTrigger>Inventory (EOQ Models)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p>Calculates the optimal order quantity to minimize inventory costs.</p>
            <p><strong>EOQ Básico:</strong> The simplest model. Requires demand, ordering cost, and holding cost.</p>
            <p><strong>EOQ with Discounts:</strong> Considers price discounts for larger orders. Requires demand, ordering cost, holding cost as a percentage, and a list of discount tiers.</p>
            <p><strong>EOQ with Shortages:</strong> Accounts for the cost of stockouts. Requires demand, ordering cost, holding cost, and shortage cost.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
