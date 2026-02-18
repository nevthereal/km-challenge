<script lang="ts">
	import { ChartContainer, type ChartConfig } from '$lib/components/ui/chart';
	import { Axis, LineChart, Tooltip as LayerTooltip } from 'layerchart';
	import { onMount } from 'svelte';

	type ChartEntry = {
		date: Date | string;
		amount: number | string;
		discipline?: {
			factor: number | string;
		} | null;
	};

	type ChartPoint = {
		date: string;
		entries: number;
		entriesScaled: number;
		kilometres: number;
		points: number;
	};

	let { title, entries }: { title: string; entries: ChartEntry[] } = $props();
	let isMobile = $state(false);

	const chartConfig = {
		entries: {
			label: 'Einträge',
			color: '#22c55e'
		},
		kilometres: {
			label: 'Kilometer',
			color: '#38bdf8'
		},
		points: {
			label: 'Punkte',
			color: '#f59e0b'
		}
	} satisfies ChartConfig;

	onMount(() => {
		const media = window.matchMedia('(max-width: 768px)');
		const apply = () => {
			isMobile = media.matches;
		};

		apply();
		media.addEventListener('change', apply);

		return () => media.removeEventListener('change', apply);
	});

	const chartData = $derived.by(() => {
		const groupedByDay = new Map<string, { entries: number; kilometres: number; points: number }>();

		for (const entry of entries ?? []) {
			const date = new Date(entry.date);
			const dayKey = date.toISOString().slice(0, 10);
			const amount = Number(entry.amount) || 0;
			const factor = Number(entry.discipline?.factor) || 0;

			const existing = groupedByDay.get(dayKey) ?? { entries: 0, kilometres: 0, points: 0 };

			existing.entries += 1;
			existing.kilometres += amount;
			existing.points += amount * factor;

			groupedByDay.set(dayKey, existing);
		}

		const aggregatedData = [...groupedByDay.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, values]) => ({
				date,
				entries: values.entries,
				kilometres: Number(values.kilometres.toFixed(2)),
				points: Number(values.points.toFixed(2))
			}));

		const maxEntries = Math.max(0, ...aggregatedData.map((point) => point.entries));
		const maxDistanceOrPoints = Math.max(
			0,
			...aggregatedData.map((point) => Math.max(point.kilometres, point.points))
		);
		const entriesScaleFactor =
			maxEntries > 0 && maxDistanceOrPoints > 0 ? maxDistanceOrPoints / maxEntries : 1;

		return aggregatedData.map((point) => ({
			...point,
			entriesScaled: Number((point.entries * entriesScaleFactor).toFixed(4))
		}));
	});

	const entriesScaleFactor = $derived.by(() => {
		const maxEntries = Math.max(0, ...chartData.map((point) => point.entries));
		const maxScaledEntries = Math.max(0, ...chartData.map((point) => point.entriesScaled));
		return maxEntries > 0 ? maxScaledEntries / maxEntries : 1;
	});

	const chartMinWidth = $derived.by(() => {
		const perPointWidth = isMobile ? 72 : 56;
		return Math.max(isMobile ? 560 : 720, chartData.length * perPointWidth);
	});

	function formatTooltipNumber(value: number, digits = 2): string {
		return Number(value || 0).toLocaleString('de-DE', {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		});
	}
</script>

<section class="mt-8 max-w-full min-w-0 overflow-hidden">
	<h2 class="h2 mb-4">{title}</h2>
	{#if chartData.length > 0}
		<div class="relative w-full overflow-x-auto">
			<div class="min-w-0" style={`min-width: ${chartMinWidth}px`}>
				<ChartContainer
					config={chartConfig}
					class="bg-card [&_.lc-axis-tick-label]:fill-foreground [&_.lc-grid-x-line]:stroke-muted-foreground/20 [&_.lc-grid-y-line]:stroke-muted-foreground/30 aspect-auto h-[220px] w-full max-w-full min-w-0 overflow-hidden rounded-xl border p-4 md:h-[240px] lg:h-[250px] [&_.lc-spline-path]:stroke-[3px] [&_.lc-spline-path]:opacity-100"
				>
					<LineChart
						data={chartData}
						x="date"
						series={[
							{
								key: 'entries',
								label: 'Einträge',
								value: 'entriesScaled',
								color: 'var(--color-entries)'
							},
							{
								key: 'kilometres',
								label: 'Kilometer',
								value: 'kilometres',
								color: 'var(--color-kilometres)'
							},
							{
								key: 'points',
								label: 'Punkte',
								value: 'points',
								color: 'var(--color-points)'
							}
						]}
						props={{
							spline: { strokeWidth: 3 },
							points: { r: isMobile ? 3 : 4, stroke: 'hsl(var(--background))', strokeWidth: 2 },
							tooltip: {
								hideTotal: true
							},
							xAxis: {
								tickSpacing: isMobile ? 90 : 70,
								format: (value) =>
									Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(
										new Date(String(value))
									)
							}
						}}
						padding={{ top: 4, left: 20, right: 42, bottom: 52 }}
						legend={true}
						points={true}
					>
						{#snippet tooltip({ context })}
							<LayerTooltip.Root {context}>
								{#snippet children({ data, payload })}
									<LayerTooltip.Header
										value={Intl.DateTimeFormat('de-DE', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric'
										}).format(new Date(String(data?.date ?? '')))}
									/>
									<LayerTooltip.List>
										{#each payload as item, index (item.key ?? index)}
											<LayerTooltip.Item
												label={item.name}
												color={item.color}
												valueAlign="right"
												value={item.key === 'entries'
													? String(Math.round(Number(data?.entries ?? item.value ?? 0)))
													: formatTooltipNumber(Number(item.value ?? 0))}
											/>
										{/each}
									</LayerTooltip.List>
								{/snippet}
							</LayerTooltip.Root>
						{/snippet}
						{#snippet axis({ getAxisProps })}
							<Axis {...getAxisProps('y')} />
							<Axis
								{...getAxisProps('y')}
								placement="right"
								label="Einträge"
								format={(value) => {
									const numericValue = Number(value) || 0;
									if (entriesScaleFactor <= 0) return '0';
									return Math.max(0, Math.round(numericValue / entriesScaleFactor)).toString();
								}}
							/>
							<Axis {...getAxisProps('x')} />
						{/snippet}
					</LineChart>
				</ChartContainer>
			</div>
		</div>
	{:else}
		<p class="font-mono font-bold italic">Noch keine Aktivität</p>
	{/if}
</section>
