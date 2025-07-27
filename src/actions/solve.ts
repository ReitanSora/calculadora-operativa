"use server";

import { z } from "zod";

// The backend URL should be stored in an environment variable.
const BACKEND_URL = "http://localhost:5000/api";

const lpSchema = z.object({
  objectiveFunction: z.array(z.number()),
  constraintMatrix: z.array(z.array(z.number())),
  rightHandSide: z.array(z.number()),
  problemType: z.enum(["max", "min"]),
  constraintTypes: z.array(z.enum(["<=", ">=", "="])),
});

const knapsackSchema = z.object({
    weights: z.array(z.number()),
    values: z.array(z.number()),
    capacity: z.number(),
});

const transportSchema = z.object({
    costs: z.array(z.array(z.number())),
    supply: z.array(z.number()),
    demand: z.array(z.number()),
});

const networkEdgeSchema = z.object({
    edges: z.array(z.tuple([z.string(), z.string(), z.number(), z.number()])),
    source: z.string(),
    target: z.string(),
});


const eoqSchema = z.object({
    weeklyDemand: z.number(),
    workingDays: z.number(),
    orderingCost: z.number(),
    holdingCost: z.number(),
    leadTime: z.number(),
});


async function solve(endpoint: string, body: any) {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Endpoint ${endpoint} not found or returned an error.` }));
      console.error("Backend Error:", errorData);
      return { error: `API Error: ${errorData.detail || errorData.message || response.statusText}` };
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    if (error instanceof Error) {
        return { error: `Network or fetch error: ${error.message}` };
    }
    return { error: "An unknown network error occurred." };
  }
}

export async function solveLP(data: z.infer<typeof lpSchema>, method: 'simplex' | 'gran-m' | 'dos-fases' | 'dual') {
  const endpointMap = {
    'simplex': '/simplex',
    'gran-m': '/bigm',
    'dos-fases': '/twophases',
    'dual': '/dual',
  }
  const endpoint = endpointMap[method];

  const payload: any = {
    objective_coeffs_str: JSON.stringify(data.objectiveFunction),
    constraint_matrix_str: JSON.stringify(data.constraintMatrix),
    rhs_values_str: JSON.stringify(data.rightHandSide),
  };

  if (method === 'gran-m' || method === 'dos-fases' || method === 'dual') {
      payload.objective_type = data.problemType;
      payload.constraint_types_str = JSON.stringify(data.constraintTypes);
  }

  return solve(endpoint, payload);
}

export async function solveKnapsack(data: z.infer<typeof knapsackSchema>) {
    const payload = {
        weights_str: JSON.stringify(data.weights),
        values_str: JSON.stringify(data.values),
        capacity_str: String(data.capacity),
    };
    return solve('/backpack', payload);
}

export async function solveTransportation(data: z.infer<typeof transportSchema>, method: 'transporte-minimo' | 'transporte-noroeste' | 'transporte-vogel') {
    const endpointMap = {
        'transporte-minimo': '/transport/minimun',
        'transporte-noroeste': '/transport/northwest',
        'transporte-vogel': '/transport/voguel',
    }
    const endpoint = endpointMap[method];
    
    const payload = {
        cost_matrix_str: JSON.stringify(data.costs),
        supply_str: JSON.stringify(data.supply),
        demand_str: JSON.stringify(data.demand),
    };
    return solve(endpoint, payload);
}

export async function solveShortestPath(data: z.infer<typeof networkEdgeSchema>) {
    const payload = {
        edges_str: JSON.stringify(data.edges),
        source: data.source,
        target: data.target,
    };
    return solve('/networks/shortestpath', payload);
}

export async function solveMaxFlow(data: z.infer<typeof networkEdgeSchema>) {
    const payload = {
        edges_str: JSON.stringify(data.edges),
        source: data.source,
        target: data.target,
    };
    return solve('/networks/maxflow', payload);
}

export async function solveMst(data: Pick<z.infer<typeof networkEdgeSchema>, 'edges'>) {
    const payload = {
        edges_str: JSON.stringify(data.edges),
    };
    return solve('/networks/minspanningtree', payload);
}

export async function solveMinCostFlow(data: z.infer<typeof networkEdgeSchema>) {
    const payload = {
        edges_str: JSON.stringify(data.edges),
        source: data.source,
        target: data.target,
    };
    return solve('/networks/mincostflow', payload);
}


export async function solveEoq(data: z.infer<typeof eoqSchema>) {
     const payload = {
        weekly_demand_str: String(data.weeklyDemand),
        working_days_per_year_str: String(data.workingDays),
        ordering_cost_str: String(data.orderingCost),
        holding_cost_str: String(data.holdingCost),
        lead_time_str: String(data.leadTime)
    };
    return solve('/inventory', payload);
}
