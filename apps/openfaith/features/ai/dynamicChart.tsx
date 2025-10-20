'use client'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@openfaith/openfaith/features/ai/chart'
import type { Config, Result } from '@openfaith/openfaith/features/ai/tools'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

type InputDataPoint = Record<string, string | number>

interface TransformedDataPoint {
  [key: string]: string | number | null
}

interface TransformationResult {
  data: Array<TransformedDataPoint>
  xAxisField: string
  lineFields: Array<string>
}

export function transformDataForMultiLineChart(
  data: Array<InputDataPoint>,
  chartConfig: Config,
): TransformationResult {
  // console.log("Input data:", data);
  const { xKey, lineCategories, measurementColumn } = chartConfig

  const fields = Object.keys(data[0] ?? {})
  // console.log("Fields:", fields);

  const xAxisField = xKey ?? 'year' // Assuming 'year' is always the x-axis
  const lineField =
    fields.find((field) => lineCategories?.includes(data[0]?.[field] as string)) || ''

  // console.log("X-axis field:", xAxisField);
  // console.log("Line field:", lineField);

  const xAxisValues = Array.from(new Set(data.map((item) => String(item[xAxisField]))))

  // console.log("X-axis values:", xAxisValues);
  // console.log("Line categories:", lineCategories);

  const transformedData: Array<TransformedDataPoint> = xAxisValues.map((xValue) => {
    const dataPoint: TransformedDataPoint = { [xAxisField]: xValue }
    lineCategories?.forEach((category) => {
      const matchingItem = data.find(
        (item) => String(item[xAxisField]) === xValue && String(item[lineField]) === category,
      )
      dataPoint[category] = matchingItem
        ? (matchingItem[measurementColumn ?? ''] as unknown as string | number | null)
        : null
    })
    return dataPoint
  })

  transformedData.sort((a, b) => Number(a[xAxisField]) - Number(b[xAxisField]))

  // console.log("Transformed data:", transformedData);

  return {
    data: transformedData,
    lineFields: lineCategories ?? [],
    xAxisField,
  }
}

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

export function DynamicChart({
  chartData,
  chartConfig,
}: {
  chartData: Array<Result>
  chartConfig: Config
}) {
  const renderChart = () => {
    if (!chartData || !chartConfig) return <div>No chart data</div>
    const parsedChartData = chartData.map((item) => {
      const parsedItem: { [key: string]: any } = {}
      for (const [key, value] of Object.entries(item)) {
        parsedItem[key] = Number.isNaN(Number(value)) ? value : Number(value)
      }
      return parsedItem
    })

    chartData = parsedChartData

    const processChartData = (data: Array<Result>, chartType: string) => {
      if (chartType === 'bar' || chartType === 'pie') {
        if (data.length <= 8) {
          return data
        }

        const subset = data.slice(0, 20)
        return subset
      }
      return data
    }

    chartData = processChartData(chartData, chartConfig.type)
    // console.log({ chartData, chartConfig });

    switch (chartConfig.type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey={chartConfig.xKey}>
              <Label offset={0} position='insideBottom' value={toTitleCase(chartConfig.xKey)} />
            </XAxis>
            <YAxis>
              <Label
                angle={-90}
                position='insideLeft'
                value={toTitleCase(chartConfig.yKeys[0] ?? '')}
              />
            </YAxis>
            <ChartTooltip content={ChartTooltipContent} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key, index) => (
              <Bar dataKey={key} fill={colors[index % colors.length]} key={key} />
            ))}
          </BarChart>
        )
      case 'line': {
        const { data, xAxisField, lineFields } = transformDataForMultiLineChart(
          chartData,
          chartConfig,
        )
        const useTransformedData =
          chartConfig.multipleLines &&
          chartConfig.measurementColumn &&
          chartConfig.yKeys.includes(chartConfig.measurementColumn)
        // console.log(useTransformedData, "useTransformedData");
        // const useTransformedData = false;
        return (
          <LineChart data={useTransformedData ? data : chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey={useTransformedData ? chartConfig.xKey : chartConfig.xKey}>
              <Label
                offset={0}
                position='insideBottom'
                value={toTitleCase(useTransformedData ? xAxisField : chartConfig.xKey)}
              />
            </XAxis>
            <YAxis>
              <Label
                angle={-90}
                position='insideLeft'
                value={toTitleCase(chartConfig.yKeys[0] ?? '')}
              />
            </YAxis>
            <ChartTooltip content={ChartTooltipContent} />
            {chartConfig.legend && <Legend />}
            {useTransformedData
              ? lineFields.map((key, index) => (
                  <Line
                    dataKey={key}
                    key={key}
                    stroke={colors[index % colors.length]}
                    type='monotone'
                  />
                ))
              : chartConfig.yKeys.map((key, index) => (
                  <Line
                    dataKey={key}
                    key={key}
                    stroke={colors[index % colors.length]}
                    type='monotone'
                  />
                ))}
          </LineChart>
        )
      }
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey={chartConfig.xKey} />
            <YAxis />
            <ChartTooltip content={ChartTooltipContent} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key, index) => (
              <Area
                dataKey={key}
                fill={colors[index % colors.length]}
                key={key}
                stroke={colors[index % colors.length]}
                type='monotone'
              />
            ))}
          </AreaChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              cx='50%'
              cy='50%'
              data={chartData}
              dataKey={chartConfig.yKeys[0]}
              nameKey={chartConfig.xKey}
              outerRadius={120}
            >
              {chartData.map((_, index) => (
                <Cell fill={colors[index % colors.length]} key={`cell-${index}`} />
              ))}
            </Pie>
            <ChartTooltip content={ChartTooltipContent} />
            {chartConfig.legend && <Legend />}
          </PieChart>
        )
      default:
        return <div>Unsupported chart type: {chartConfig.type}</div>
    }
  }

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <h2 className='mb-2 font-bold text-lg'>{chartConfig.title}</h2>
      {chartConfig && chartData.length > 0 && (
        <ChartContainer
          className='h-[320px] w-full'
          config={chartConfig.yKeys.reduce(
            (acc, key, index) => {
              acc[key] = {
                color: colors[index % colors.length] as string,
                label: key,
              }
              return acc
            },
            {} as Record<string, { label: string; color: string }>,
          )}
        >
          {renderChart()}
        </ChartContainer>
      )}
      <div className='w-full'>
        <p className='mt-4 text-sm'>{chartConfig.description}</p>
        <p className='mt-4 text-sm'>{chartConfig.takeaway}</p>
      </div>
    </div>
  )
}
