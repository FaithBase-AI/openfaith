import { anthropic } from '@ai-sdk/anthropic'
import {
  generateChartConfigTool,
  generateQueryTool,
  runQueryTool,
} from '@openfaith/openfaith/features/ai/tools'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'

export const ServerRoute = createServerFileRoute('/api/ai/chat').methods({
  POST: async ({ request }) => {
    try {
      const { messages } = await request.json()

      const result = streamText({
        messages: convertToModelMessages(messages),
        model: anthropic('claude-haiku-4-5'),
        stopWhen: stepCountIs(5),
        system: `You are a helpful assistant that helps OpenFaith users interact with their data. You have access to the following tools:
        - generateChartConfig: Generate a chart config based on the data and user query.
        - generateQuery: Generate a SQL query based on the user query.
        - runQuery: Run a SQL query and return the results.

        When the user asks a question, you should use the generateQuery tool to generate a SQL query. Then you should use the runQuery tool to run the query and return the results.
        Then you should use the generateChartConfig tool to generate a chart config based on the data and user query.
        Then you should return the chart config to the user.

        If the user asks a question that is not related to the data, you should say that you are not sure how to help with that.
        `,
        temperature: 0.7,
        tools: {
          generateChartConfig: generateChartConfigTool,
          generateQuery: generateQueryTool,
          runQuery: runQueryTool,
        },
      })

      return result.toUIMessageStreamResponse()
    } catch (error) {
      console.error('Chat API error:', error)
      return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  },
})
