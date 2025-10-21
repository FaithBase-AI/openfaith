import { DynamicChart } from '@openfaith/openfaith/features/ai/dynamicChart'
import { SkeletonCard } from '@openfaith/openfaith/features/ai/skeletonCard'
import type { Config, Result } from '@openfaith/openfaith/features/ai/tools'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@openfaith/ui'
import { Array, pipe, Record } from 'effect'

export const Results = ({
  results,
  chartConfig,
}: {
  results: Array<Result>
  chartConfig: Config | null
}) => {
  const formatColumnTitle = (title: string) => {
    return title
      .split('_')
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(' ')
  }

  const formatCellValue = (column: string, value: any) => {
    if (column.toLowerCase().includes('valuation')) {
      const parsedValue = Number.parseFloat(value)
      if (Number.isNaN(parsedValue)) {
        return ''
      }
      const formattedValue = parsedValue.toFixed(2)
      const trimmedValue = formattedValue.replace(/\.?0+$/, '')
      return `$${trimmedValue}B`
    }
    if (column.toLowerCase().includes('rate')) {
      const parsedValue = Number.parseFloat(value)
      if (Number.isNaN(parsedValue)) {
        return ''
      }
      const percentage = (parsedValue * 100).toFixed(2)
      return `${percentage}%`
    }
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    return String(value)
  }

  const columns = pipe(
    results,
    Array.map(({ id, ...result }) => pipe(result, Record.keys)),
    Array.flatten,
    Array.dedupe,
  )

  return (
    <div className='flex flex-grow flex-col'>
      <Tabs className='flex w-full flex-grow flex-col' defaultValue='table'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='table'>Table</TabsTrigger>
          <TabsTrigger
            disabled={Object.keys(results[0] || {}).length <= 1 || results.length < 2}
            value='charts'
          >
            Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent className='flex-grow' value='table'>
          <div className='relative sm:min-h-[10px]'>
            <Table className='min-w-full divide-y divide-border'>
              <TableHeader className='sticky top-0 bg-secondary shadow-sm'>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      className='px-6 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider'
                      key={index}
                    >
                      {formatColumnTitle(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className='divide-y divide-border bg-card'>
                {results.map((company, index) => (
                  <TableRow className='hover:bg-muted' key={index}>
                    {columns.map((column, cellIndex) => (
                      <TableCell
                        className='whitespace-nowrap px-6 py-4 text-foreground text-sm'
                        key={cellIndex}
                      >
                        {formatCellValue(column, company[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent className='flex-grow overflow-auto' value='charts'>
          <div className='mt-4'>
            {chartConfig && results.length > 0 ? (
              <DynamicChart chartConfig={chartConfig} chartData={results} />
            ) : (
              <SkeletonCard />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
