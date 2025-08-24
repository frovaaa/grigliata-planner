'use client';

import { Tabs, Box, Progress, Text, Group, Stack } from '@mantine/core';
import { ScenarioKey, BaseTotals, ScenarioTotals, applyScenario, getScenarioNames, getItemNames } from '@/lib/calc';
import { TotalsTable } from './TotalsTable';

interface ScenarioTabsProps {
  baseTotals: BaseTotals;
  activeScenario: ScenarioKey;
  onScenarioChange: (scenario: ScenarioKey) => void;
}

export function ScenarioTabs({ baseTotals, activeScenario, onScenarioChange }: ScenarioTabsProps) {
  const scenarioNames = getScenarioNames();
  const itemNames = getItemNames();
  
  const scenarios: ScenarioKey[] = ['classico', 'chicken', 'budget', 'veg'];
  const classicTotals = applyScenario(baseTotals, 'classico');
  
  // Calculate differences from classic for progress bars
  const getDifferences = (totals: ScenarioTotals) => {
    return Object.entries(totals).map(([key, value]) => {
      const classicValue = classicTotals[key as keyof ScenarioTotals].grams;
      const diff = classicValue === 0 ? 0 : ((value.grams - classicValue) / classicValue) * 100;
      return {
        item: itemNames[key as keyof typeof itemNames],
        diff: Math.round(diff),
        color: diff > 0 ? 'teal' : diff < 0 ? 'red' : 'gray',
      };
    });
  };

  const tabs = scenarios.map((scenario) => {
    const scenarioTotals = applyScenario(baseTotals, scenario);
    const differences = getDifferences(scenarioTotals);
    
    return (
      <Tabs.Panel key={scenario} value={scenario}>
        <Stack gap="md">
          <TotalsTable totals={scenarioTotals} />
          
          {scenario !== 'classico' && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Differenze rispetto al Classico:
              </Text>
              <Stack gap="xs">
                {differences.map((diff) => (
                  <Group key={diff.item} gap="md" justify="space-between">
                    <Text size="sm" style={{ minWidth: 120 }}>
                      {diff.item}
                    </Text>
                    <Box style={{ flex: 1, maxWidth: 200 }}>
                      <Progress
                        value={Math.abs(diff.diff)}
                        color={diff.color}
                        size="sm"
                        radius="xl"
                      />
                    </Box>
                    <Text size="sm" w={60} ta="right" c={diff.color}>
                      {diff.diff > 0 ? '+' : ''}{diff.diff}%
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Tabs.Panel>
    );
  });

  return (
    <Tabs value={activeScenario} onChange={(value) => onScenarioChange(value as ScenarioKey)}>
      <Tabs.List>
        {scenarios.map((scenario) => (
          <Tabs.Tab key={scenario} value={scenario}>
            {scenarioNames[scenario]}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs}
    </Tabs>
  );
}