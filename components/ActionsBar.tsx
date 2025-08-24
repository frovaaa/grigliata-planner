'use client';

import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconFileTypeCsv, IconPrinter, IconRefresh } from '@tabler/icons-react';
import { ScenarioTotals, getItemNames } from '@/lib/calc';
import { notifications } from '@mantine/notifications';

interface ActionsBarProps {
  totals: ScenarioTotals;
  onReset: () => void;
}

export function ActionsBar({ totals, onReset }: ActionsBarProps) {
  const itemNames = getItemNames();

  const copyToClipboard = () => {
    const text = Object.entries(totals)
      .filter(([, value]) => value.grams > 0)
      .map(([key, value]) => `${itemNames[key as keyof typeof itemNames]}: ${value.kg} kg`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      notifications.show({
        message: 'Lista copiata negli appunti!',
        color: 'green',
      });
    }).catch(() => {
      notifications.show({
        message: 'Errore durante la copia',
        color: 'red',
      });
    });
  };

  const exportToCsv = () => {
    const csvContent = [
      'Prodotto,Grammi,Chilogrammi',
      ...Object.entries(totals)
        .filter(([, value]) => value.grams > 0)
        .map(([key, value]) => `${itemNames[key as keyof typeof itemNames]},${value.grams},${value.kg}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista-grigliata.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Lista Grigliata</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; border-top: 2px solid #333; }
          </style>
        </head>
        <body>
          <h1>Lista della Spesa - Grigliata</h1>
          <table>
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Grammi</th>
                <th>Chilogrammi</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(totals)
                .filter(([, value]) => value.grams > 0)
                .map(([key, value]) => `
                  <tr>
                    <td>${itemNames[key as keyof typeof itemNames]}</td>
                    <td>${value.grams} g</td>
                    <td>${value.kg} kg</td>
                  </tr>
                `).join('')}
              <tr class="total">
                <td>Totale</td>
                <td></td>
                <td>${Object.values(totals).reduce((sum, item) => sum + item.kg, 0).toFixed(2)} kg</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Group justify="space-between">
      <Group>
        <Button leftSection={<IconCopy size={16} />} variant="light" onClick={copyToClipboard}>
          Copia lista
        </Button>
        
        <Button leftSection={<IconFileTypeCsv size={16} />} variant="light" onClick={exportToCsv}>
          Esporta CSV
        </Button>
        
        <Button leftSection={<IconPrinter size={16} />} variant="light" onClick={handlePrint}>
          Stampa
        </Button>
      </Group>
      
      <Tooltip label="Reimposta tutto">
        <ActionIcon variant="light" color="red" onClick={onReset}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}