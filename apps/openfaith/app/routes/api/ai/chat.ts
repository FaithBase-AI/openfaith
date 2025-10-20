import { createServerFileRoute } from '@tanstack/react-start/server'
import { convertToModelMessages, streamText } from 'ai'

// @ts-expect-error - prompt1 is not used
const _prompt1 = `You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:

      unicorns (
      id SERIAL PRIMARY KEY,
      company VARCHAR(255) NOT NULL UNIQUE,
      valuation DECIMAL(10, 2) NOT NULL,
      date_joined DATE,
      country VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      industry VARCHAR(255) NOT NULL,
      select_investors TEXT NOT NULL
    );

    Only retrieval queries are allowed.

    For things like industry, company names and other string fields, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(industry) ILIKE LOWER('%search_term%').

    Note: select_investors is a comma-separated list of investors. Trim whitespace to ensure you're grouping properly. Note, some fields may be null or have only one value.
    When answering questions about a specific field, ensure you are selecting the identifying column (ie. what is Vercel's valuation would select company and valuation').

    The industries available are:
    - healthcare & life sciences
    - consumer & retail
    - financial services
    - enterprise tech
    - insurance
    - media & entertainment
    - industrials
    - health

    If the user asks for a category that is not in the list, infer based on the list above.

    Note: valuation is in billions of dollars so 10b would be 10.0.
    Note: if the user asks for a rate, return it as a decimal. For example, 0.1 would be 10%.

    If the user asks for 'over time' data, return by year.

    When searching for UK or USA, write out United Kingdom or United States respectively.

    EVERY QUERY SHOULD RETURN QUANTITATIVE DATA THAT CAN BE PLOTTED ON A CHART! There should always be at least two columns. If the user asks for a single column, return the column and the count of the column. If the user asks for a rate, return the rate as a decimal. For example, 0.1 would be 10%.
    `

export const ServerRoute = createServerFileRoute('/api/ai/chat').methods({
  POST: async ({ request }) => {
    try {
      const { messages } = await request.json()

      const result = streamText({
        messages: convertToModelMessages(messages),
        model: 'anthropic/claude-haiku-4-5',
        // stopWhen: stepCountIs(5),
        // system: ``,
        // temperature: 0.7,
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
