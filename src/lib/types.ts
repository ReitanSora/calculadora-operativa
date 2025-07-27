export type Method = 
  | 'simplex' 
  | 'gran-m' 
  | 'dos-fases' 
  | 'dual' 
  | 'transporte-minimo'
  | 'transporte-noroeste'
  | 'transporte-vogel'
  | 'mochila'
  | 'shortest-path'
  | 'max-flow'
  | 'min-spanning-tree'
  | 'min-cost-flow'
  | 'eoq'
  ;

export type MethodFamily = 'lp' | 'transport' | 'knapsack' | 'network' | 'inventory';

export const ALL_METHODS: { value: Method; label: string; family: MethodFamily }[] = [
    { value: 'simplex', label: 'Simplex', family: 'lp' },
    { value: 'gran-m', label: 'Gran M', family: 'lp' },
    { value: 'dos-fases', label: 'Dos Fases', family: 'lp' },
    { value: 'dual', label: 'Dual', family: 'lp' },
    { value: 'transporte-minimo', label: 'Costo Mínimo', family: 'transport' },
    { value: 'transporte-noroeste', label: 'Esquina Noroeste', family: 'transport' },
    { value: 'transporte-vogel', label: 'Aproximación de Vogel', family: 'transport' },
    { value: 'mochila', label: 'Mochila (Prog. Dinámica)', family: 'knapsack' },
    { value: 'shortest-path', label: 'Ruta más corta', family: 'network' },
    { value: 'max-flow', label: 'Flujo Máximo', family: 'network' },
    { value: 'min-spanning-tree', label: 'Árbol de Expansión Mínima', family: 'network' },
    { value: 'min-cost-flow', label: 'Flujo de Costo Mínimo', family: 'network' },
    { value: 'eoq', label: 'Inventario (EOQ)', family: 'inventory' },
];

interface BaseSolution {
    interpretation_ia?: string;
}

export interface SimplexSolution extends BaseSolution {
    optimal_value: number;
    variable_values: Record<string, number>;
    iterations: number;
    tableau: number[][];
}

interface BigMIteration {
    iteration: number;
    tableau: number[][];
    basic_vars: number[];
}

export interface BigMSolution extends BaseSolution {
    status: 'optimal' | 'infeasible' | 'unbounded';
    solution: number[];
    optimal_value: number;
    iterations: BigMIteration[];
    final_tableau: number[][];
}

interface TwoPhaseIteration {
    iteration: number;
    phase: number;
    tableau: number[][];
    basic_vars: number[];
    solution: number[];
    entering: number | null;
    leaving: number | null;
}

export interface TwoPhaseSolution extends BaseSolution {
    status: 'optimal' | 'infeasible' | 'unbounded';
    solution: number[];
    optimal_value: number;
    iterations: TwoPhaseIteration[];
    phase1_iterations: number;
    phase2_iterations: number;
}

export interface DualSolution extends BaseSolution {
    objective: 'max' | 'min';
    objective_coefficients: number[];
    constraint_coefficients: number[][];
    constraint_constants: number[];
    constraint_types: string[];
}


export interface KnapsackSolution extends BaseSolution {
    valor_total: number;
    peso_total: number;
    items_seleccionados: {
        item: number;
        peso: number;
        valor: number;
        cantidad: number;
    }[];
}

export interface TransportationSolution extends BaseSolution {
    allocation_matrix: number[][];
    total_cost: number;
    solucion_basica?: any[];
}

export interface ShortestPathSolution extends BaseSolution {
    distance: number;
    path: string[];
    interpretation: string;
}

export interface MaxFlowSolution extends BaseSolution {
    max_flow: number;
    interpretation: string;
}

export interface MstSolution extends BaseSolution {
    mst: [string, string, number, number][];
    interpretation: string;
}

export interface MinCostFlowSolution extends BaseSolution {
    total_flow: number;
    total_cost: number;
    interpretation: string;
}


export interface EOQSolution extends BaseSolution {
    reorder_point: number;
    eoq: number;
    days_between_orders: number;
    orders_per_year: number;
    [key: string]: any;
}

export type Solution = 
    | SimplexSolution
    | BigMSolution
    | TwoPhaseSolution
    | DualSolution
    | KnapsackSolution 
    | TransportationSolution 
    | ShortestPathSolution
    | MaxFlowSolution
    | MstSolution
    | MinCostFlowSolution
    | EOQSolution
    | { error: string } 
    | null;