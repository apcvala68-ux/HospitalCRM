import { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext({});

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const { activeTab, setActiveTab, onValueChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  const handleClick = () => {
    setActiveTab(value);
    if (onValueChange) onValueChange(value);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>{children}</div>;
}
