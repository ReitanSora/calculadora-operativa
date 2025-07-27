# **App Name**: OptiSolve

## Core Features:

- Method Selection: Allow users to select different operational research methods (Simplex, Big M, Two-Phase, Duals, Transportation, Networks, Inventory, Dynamic Programming/Knapsack) from a dropdown.
- Dynamic Form Generation: Create interactive forms based on the selected method, dynamically adjusting input fields for problem-specific data.
- Data Submission: Submit the user-provided data to the specified backend API (https://github.com/ReitanSora/operativa).
- Solution Display: Display the solution returned by the backend API in a clear, formatted, readable manner. The solution might come as JSON. Use this fact as a tool for automated extraction of the relevant bits from the response.
- Graphical Visualization: Offer the option to visualize the problem and the solution graphically (e.g., network diagrams, constraint boundaries).
- Error Handling: Implement basic error handling to display messages for invalid inputs or backend errors.
- Help Documentation: Include a dedicated section offering guides or examples of the different operational research models the system support

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), symbolizing intellect and efficiency.
- Background color: Light gray (#F0F2F5), a desaturated hue from the primary color, offering a clean and neutral backdrop.
- Accent color: Cyan (#00BCD4), analogous to indigo, used to highlight interactive elements.
- Body and headline font: 'Inter', a sans-serif font, known for its modern and neutral appearance, making it ideal for both headlines and body text.
- Use simple, geometric icons to represent different methods and actions.
- Employ a clean, modular layout with clear sections for input, output, and visualization.
- Use subtle transitions and animations to guide the user and provide feedback.