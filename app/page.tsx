'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Select,
  Switch,
  Accordion,
  Grid,
  Divider,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconGrill, IconUsers, IconSettings, IconCalculator } from '@tabler/icons-react';
import {
  GuestInput,
  ItemParams,
  ScenarioKey,
  ItemKey,
  BaseTotals,
  calcBaseTotals,
  applyScenario,
  getDefaultParams,
  getTotalKg,
} from '@/lib/calc';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/storage';
import { NumberField } from '@/components/NumberField';
import { ScenarioTabs } from '@/components/ScenarioTabs';
import { ActionsBar } from '@/components/ActionsBar';

export default function HomePage() {
  const [params, setParams] = useState<Record<ItemKey, ItemParams>>(getDefaultParams());
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('classico');
  const [includeBuffer, setIncludeBuffer] = useState(false);
  const [results, setResults] = useState<BaseTotals | null>(null);
  
  const form = useForm<GuestInput>({
    initialValues: {
      adults: 0,
      children: 0,
      vegAdults: 0,
      vegChildren: 0,
      appetite: 'normal',
      includeSides: false,
    },
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.guestInput) {
      form.setValues(stored.guestInput);
    }
    if (stored.params) {
      setParams(stored.params as Record<ItemKey, ItemParams>);
    }
    if (stored.includeBuffer !== undefined) {
      setIncludeBuffer(stored.includeBuffer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    saveToStorage({
      guestInput: form.values,
      params,
      includeBuffer,
    });
  }, [form.values, params, includeBuffer]);

  const handleCalculate = () => {
    const baseTotals = calcBaseTotals(form.values, params);
    setResults(baseTotals);
  };

  const handleReset = () => {
    form.reset();
    setParams(getDefaultParams());
    setIncludeBuffer(false);
    setResults(null);
    clearStorage();
  };

  const updateParam = (item: ItemKey, field: keyof ItemParams, value: number | boolean) => {
    setParams((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        [field]: value,
      },
    }));
  };

  const totalGuests = form.values.adults + form.values.children + form.values.vegAdults + form.values.vegChildren;
  const currentTotals = results ? applyScenario(results, activeScenario) : null;
  const totalKg = currentTotals ? getTotalKg(currentTotals) : 0;
  const totalWithBuffer = includeBuffer ? totalKg * 1.1 : totalKg;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" radius="md" withBorder>
          <Group>
            <IconGrill size={32} />
            <div>
              <Title order={1}>Grigliata Planner</Title>
              <Text c="dimmed">
                Calcola quanta carne e alternative comprare per la tua grigliata
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Input Form */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Group>
              <IconUsers size={20} />
              <Title order={2}>Invitati</Title>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <NumberField
                  label="Adulti onnivori"
                  {...form.getInputProps('adults')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <NumberField
                  label="Bambini onnivori"
                  {...form.getInputProps('children')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <NumberField
                  label="Adulti vegetariani"
                  {...form.getInputProps('vegAdults')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <NumberField
                  label="Bambini vegetariani"
                  {...form.getInputProps('vegChildren')}
                />
              </Grid.Col>
            </Grid>

            <Group>
              <Select
                label="Appetito medio"
                data={[
                  { value: 'light', label: 'Leggero (-20%)' },
                  { value: 'normal', label: 'Normale' },
                  { value: 'high', label: 'Alto (+20%)' },
                ]}
                {...form.getInputProps('appetite')}
                style={{ width: 200 }}
              />
              
              <Switch
                label="Includi contorni/verdure"
                {...form.getInputProps('includeSides', { type: 'checkbox' })}
                mt="xl"
              />
            </Group>

            {totalGuests > 0 && (
              <Group>
                <Badge size="lg" variant="light">
                  Totale invitati: {totalGuests}
                </Badge>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Portion Parameters */}
        <Paper p="xl" radius="md" withBorder>
          <Accordion variant="contained">
            <Accordion.Item value="params">
              <Accordion.Control icon={<IconSettings size={20} />}>
                <Title order={2}>Parametri Porzioni</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Modifica le grammature base per persona. I valori sono in grammi.
                  </Text>
                  
                  <Grid>
                    {Object.entries(params).map(([key, param]) => (
                      <Grid.Col key={key} span={12}>
                        <Group gap="lg" align="center">
                          <Switch
                            checked={param.enabled}
                            onChange={(event) =>
                              updateParam(key as ItemKey, 'enabled', event.currentTarget.checked)
                            }
                          />
                          <Text w={120} fw={500}>
                            {key === 'manzo' && 'Manzo'}
                            {key === 'pollo' && 'Pollo'}
                            {key === 'salsiccia' && 'Salsiccia'}
                            {key === 'maiale' && 'Maiale'}
                            {key === 'tofu' && 'Tofu'}
                            {key === 'verdure' && 'Verdure'}
                          </Text>
                          <NumberField
                            label="Adulto (g)"
                            value={param.baseAdult}
                            onChange={(value) => updateParam(key as ItemKey, 'baseAdult', value)}
                            disabled={!param.enabled}
                            style={{ width: 100 }}
                          />
                          <NumberField
                            label="Bambino (g)"
                            value={param.baseChild}
                            onChange={(value) => updateParam(key as ItemKey, 'baseChild', value)}
                            disabled={!param.enabled}
                            style={{ width: 100 }}
                          />
                        </Group>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Paper>

        {/* Calculate Button */}
        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconCalculator size={20} />}
            onClick={handleCalculate}
            disabled={totalGuests === 0}
          >
            Calcola Quantità
          </Button>
        </Group>

        {/* Results */}
        {results && currentTotals && (
          <>
            <Divider />
            
            <Paper p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <Title order={2}>Risultati</Title>
                  <Group>
                    <Badge size="lg" variant="gradient">
                      Totale: {totalWithBuffer.toFixed(2)} kg
                      {includeBuffer && ' (con scorta +10%)'}
                    </Badge>
                    <Switch
                      label="Aggiungi 10% scorta"
                      checked={includeBuffer}
                      onChange={(event) => setIncludeBuffer(event.currentTarget.checked)}
                    />
                  </Group>
                </Group>

                <ScenarioTabs
                  baseTotals={results}
                  activeScenario={activeScenario}
                  onScenarioChange={setActiveScenario}
                />

                <ActionsBar
                  totals={currentTotals}
                  onReset={handleReset}
                />
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
}