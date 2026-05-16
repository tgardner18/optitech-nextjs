import { createContext } from 'react'

// Shared by Row (provider) and Column (consumer).
// Default 'md' matches the Row display template's default showAsRowFrom choice.
export const RowBreakpointContext = createContext<string>('md')
