'use client';

import { Table, Text, Box } from '@mantine/core';
import { BaseTotals, ScenarioTotals, getItemNames } from '@/lib/calc';

interface TotalsTableProps {
  totals: BaseTotals | ScenarioTotals;
  showTotal?: boolean;
}

export function TotalsTable({ totals, showTotal = true }: TotalsTableProps) {
  const itemNames = getItemNames();
  
  const totalKg = Object.values(totals).reduce((sum, item) => sum + item.kg, 0);
  
  const rows = Object.entries(totals).map(([key, value]) => {
    const isZero = value.grams === 0;
    
    return (
      <Table.Tr key={key} style={{ opacity: isZero ? 0.5 : 1 }}>
        <Table.Td>
          <Text fw={isZero ? 400 : 500}>
            {itemNames[key as keyof typeof itemNames]}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text ta="right" c={isZero ? 'dimmed' : undefined}>
            {value.grams} g
          </Text>
        </Table.Td>
        <Table.Td>
          <Text ta="right" fw={500} c={isZero ? 'dimmed' : undefined}>
            {value.kg} kg
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Prodotto</Table.Th>
            <Table.Th ta="right">Grammi</Table.Th>
            <Table.Th ta="right">Chilogrammi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
        {showTotal && (
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th>
                <Text fw={700}>Totale</Text>
              </Table.Th>
              <Table.Th></Table.Th>
              <Table.Th ta="right">
                <Text fw={700} size="lg">
                  {totalKg.toFixed(2)} kg
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        )}
      </Table>
    </Box>
  );
}