"use client";

import { useState } from 'react';
import { ALL_METHODS, Method, Solution, MethodFamily } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LPForm from '@/components/forms/lp-form';
import SolutionDisplay from '@/components/solution-display';
import KnapsackForm from './forms/knapsack-form';
import TransportationForm from './forms/transportation-form';
import { AlertCircle, BrainCircuit, Construction } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import NetworkForm from './forms/network-form';
import InventoryForm from './forms/inventory-form';

export default function SolverPage() {
  const [selectedMethod, setSelectedMethod] = useState<Method>('simplex');
  const [solution, setSolution] = useState<Solution>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value as Method);
    setSolution(null);
  };

  const currentMethod = ALL_METHODS.find(m => m.value === selectedMethod);
  const family = currentMethod?.family;

  const renderForm = () => {
    switch (family) {
      case 'lp':
        return <LPForm setSolution={setSolution} setIsLoading={setIsLoading} isLoading={isLoading} method={selectedMethod as 'simplex' | 'gran-m' | 'dos-fases' | 'dual'} />;
      case 'knapsack':
        return <KnapsackForm setSolution={setSolution} setIsLoading={setIsLoading} isLoading={isLoading} />;
      case 'transport':
          return <TransportationForm setSolution={setSolution} setIsLoading={setIsLoading} isLoading={isLoading} method={selectedMethod as 'transporte-minimo' | 'transporte-noroeste' | 'transporte-vogel'} />;
      case 'network':
          return <NetworkForm setSolution={setSolution} setIsLoading={setIsLoading} isLoading={isLoading} method={selectedMethod as 'shortest-path' | 'max-flow' | 'min-spanning-tree' | 'min-cost-flow'} />;
      case 'inventory':
          return <InventoryForm setSolution={setSolution} setIsLoading={setIsLoading} isLoading={isLoading} />;
      default:
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Under Construction</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center justify-center text-center p-12'>
                    <Construction className="h-16 w-16 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">The solver for '{currentMethod?.label}' is not yet implemented.</p>
                </CardContent>
            </Card>
          );
    }
  };
  
  const methodGroups: { group: MethodFamily, label: string }[] = [
      { group: 'lp', label: 'Programación Lineal' },
      { group: 'transport', label: 'Transporte' },
      { group: 'knapsack', label: 'Mochila' },
      { group: 'network', label: 'Redes' },
      { group: 'inventory', label: 'Inventario' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select a Method</CardTitle>
              <CardDescription>Choose the operations research method you want to use.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleMethodChange} defaultValue={selectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  {methodGroups.map(({ group, label }) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{label}</SelectLabel>
                      {ALL_METHODS.filter(m => m.family === group).map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Input Data</CardTitle>
              <CardDescription>Enter the data for your problem based on the selected method.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderForm()}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                Solution
              </CardTitle>
              <CardDescription>The result from the solver will be displayed here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-muted-foreground">Solving...</span>
                  </div>
                </div>
              ) : solution ? (
                <SolutionDisplay solution={solution} />
              ) : (
                <Alert variant="default" className="bg-secondary">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Awaiting Input</AlertTitle>
                  <AlertDescription>
                    Enter your problem data and click "Solve" to see the solution.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
