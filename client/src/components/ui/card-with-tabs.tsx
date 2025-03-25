import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

interface CardWithTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export interface TabContentProps {
  children: ReactNode;
  className?: string;
}

export const TabContent: React.FC<TabContentProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

export const CardWithTabs: React.FC<CardWithTabsProps> = ({ 
  tabs, 
  defaultTab, 
  className = ''
}) => {
  return (
    <Card className={className}>
      <Tabs defaultValue={defaultTab || tabs[0]?.key}>
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <CardContent>
              {tab.content}
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};