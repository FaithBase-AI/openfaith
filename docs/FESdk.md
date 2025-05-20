## OpenFaith Frontend SDK: Dynamic UI Generation & Pre-built Components

A core goal of the OpenFaith platform is to accelerate the development of rich, data-driven church management applications. To achieve this, OpenFaith will provide a **Frontend SDK** designed to dynamically generate common UI structures and ship a set of **pre-built, customizable React components** for interacting with OpenFaith data. These components will be based on the popular and accessible [**shadcn/ui**](https://ui.shadcn.com/) library, ensuring a modern, clean aesthetic out-of-the-box.

The SDK leverages the OpenFaith Canonical Data Model (CDM) schemas, defined using [Effect.Schema](https://effect.website/docs/schema/introduction), to automate UI generation and power these components.

### The Challenge: Repetitive UI Development & Inconsistent Experiences

For any data entity (Persons, Groups, Events, etc.), developers face significant repetitive work:

1.  **Displaying Data:** Defining table columns, data cell renderers, card layouts, and list views.
2.  **Data Entry & Editing:** Creating form fields, input types, validation logic, and submission handlers.
3.  **Consistent Look & Feel:** Ensuring UI elements are styled consistently and adhere to accessibility best practices.

This not only slows development but can lead to fragmented user experiences.

### The OpenFaith Frontend SDK Solution: Schema-Driven UI with Pre-built `shadcn/ui` Components

The OpenFaith Frontend SDK addresses these challenges by:

1.  **Dynamically Generating UI Definitions:** Using the metadata within CDM `effect/Schema` definitions to create configurations for popular libraries like TanStack Table and TanStack Forms.
2.  **Providing Pre-built React Components:** Offering a library of default UI components (built with `shadcn/ui` and Tailwind CSS) for common display and input scenarios. These components are designed to be easily customizable and themeable.
3.  **Powering AI Interactions:** These same UI components can be leveraged by the AI Chat interface to render data, present forms for clarification, or display results of actions, creating a seamless experience between conversational AI and structured UI elements.

**How it Works (Conceptual):**

1.  **Schema as the Source of Truth:** Your OpenFaith CDM schemas (e.g., `PersonSchema`) provide field names, data types, validation rules, user-friendly labels (via `annotations`), and relationship information. Custom fields (defined via the `Field` entity) are also translated into schema representations.

2.  **SDK Helper Functions & Component Library:**

    - **Dynamic Definitions:** Functions like `createTableDefsFromSchema(entitySchema)` and `createFormDefsFromSchema(entitySchema)` generate configurations for TanStack Table/Forms.
    - **Component Set:** The SDK provides components like:
      - `<OpenFaithFormField schemaField={...} form={...} />`: Renders an appropriate `shadcn/ui` input (Input, Textarea, Select, Checkbox, DatePicker, etc.) based on the `fieldType` from the schema, including labels and validation messages.
      - `<OpenFaithTableHeader schemaField={...} />`: Renders sortable column headers.
      - `<OpenFaithTableCell schemaField={...} data={...} />`: Renders data cells with appropriate formatting.
      - `<OpenFaithEntityCard schema={...} data={...} />`: A default card view for an entity.
      - `<OpenFaithKanbanCard schema={...} data={...} />`: A default card for Kanban board views.
      - `<OpenFaithTable schema={...} data={...} />` and `<OpenFaithForm schema={...} onSubmit={...} />`: Higher-level components that compose the above.

3.  **Usage Example (Illustrative):**

    ```typescript jsx
    import { PersonSchema } from "@openfaith/schemas";
    import {
      OpenFaithTable,
      OpenFaithForm,
    } from "@openfaith/sdk-frontend-react"; // Hypothetical SDK import

    // Displaying a table of people
    function PeopleList({ peopleData }) {
      return <OpenFaithTable schema={PersonSchema} data={peopleData} />;
    }

    // Displaying a form to create/edit a person
    function PersonEditor({ initialData, onSubmit }) {
      return (
        <OpenFaithForm
          schema={PersonSchema}
          initialValues={initialData}
          onSubmit={onSubmit}
        />
      );
    }
    ```

    The `<OpenFaithTable>` and `<OpenFaithForm>` components would internally use the SDK helpers to generate TanStack Table/Form configurations and then render the appropriate `shadcn/ui`-based field and cell components.

4.  **Integration with AI Chat:**
    - When the AI Chat needs to display a list of records (e.g., "Show me members of the 'Welcome Team'"), it can invoke a component like `<OpenFaithTable schema={GroupMembersSchema} data={results} />` or `<OpenFaithEntityCard />` for each member to render the information within the chat interface.
    - If the AI needs more information to complete an action (e.g., "Create a new event." AI: "Okay, what's the event name and date?"), it can present an `<OpenFaithForm schema={PartialEventSchemaForAI} />` focused on the missing fields.
    - This ensures consistency between the standard UI and AI-driven interactions.

### Benefits of the Frontend SDK with `shadcn/ui` Components

1.  **Accelerated Development:** Drastically reduces boilerplate for common UI patterns.
2.  **Professional UI Out-of-the-Box:** `shadcn/ui` provides a modern, accessible, and highly customizable look and feel.
3.  **Consistency:** Ensures data display, input fields, and validation are consistent with the CDM definitions across all parts of an application, including AI interactions.
4.  **Customizable Defaults:** While providing sensible defaults, developers can easily override or extend the provided components to fit specific application needs, leveraging `shadcn/ui`'s composition model.
5.  **Single Source of Truth:** UI elements (labels, input types, validation) are derived from `effect/Schema`, minimizing discrepancies.
6.  **Enhanced AI Experience:** The AI can use the same trusted UI components to display data or request input, making the conversational interface more robust and visually integrated.
7.  **Community & Ecosystem:** Building on popular libraries like TanStack and `shadcn/ui` fosters a larger community and makes it easier for developers to contribute or adopt.

### Initial Focus & Future Possibilities

- **Initial Focus:**
  - Core set of `shadcn/ui`-based components for form fields (input, select, date, checkbox, textarea), table cells, and basic card views.
  - Robust generation of TanStack Table and TanStack Forms configurations from `effect/Schema`.
- **Future Possibilities:**
  - More complex view components (e.g., calendar views, detailed entity views, relationship browsers).
  - Advanced Kanban board components.
  - Theming capabilities to easily adapt the look and feel.
  - SDKs for other frontend frameworks, potentially sharing the core schema-to-definition logic.

### Conclusion

The OpenFaith Frontend SDK, with its dynamic UI definition capabilities and pre-built `shadcn/ui` React components, aims to revolutionize how developers build UIs for church management applications. By providing a powerful combination of schema-driven automation and high-quality default components, the SDK will free up developers to focus on unique application logic and user experience. This integration of schema, UI components, and AI interaction is key to OpenFaith's strategy for creating a highly productive, flexible, and intelligent development ecosystem.
