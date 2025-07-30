# Form Generation

## Overview

OpenFaith uses annotation-driven form generation that automatically creates forms from Effect schemas. The system respects field visibility, types, and validation rules defined in schema annotations, providing a consistent experience between tables and forms.

## Field Visibility

Fields can be hidden from forms using the `field.hidden` annotation:

```typescript
const MySchema = Schema.Struct({
  visibleField: Schema.String.annotations({
    [OfUiConfig]: {
      field: {
        type: "text",
        label: "Visible Field",
      },
    },
  }),
  hiddenField: Schema.String.annotations({
    [OfUiConfig]: {
      field: {
        hidden: true, // This field won't appear in forms
      },
    },
  }),
});
```

## System Field Filtering

System fields are automatically hidden from forms based on:

1. **Explicit annotations**: `field: { hidden: true }`
2. **System field names**: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`, `inactivatedAt`, `inactivatedBy`, `customFields`, `tags`
3. **Entity type fields**: `_tag`, `type`
4. **System identification fields**: `id`, `orgId`, `externalIds` (when they have system descriptions containing "typeid" or "external ids")

## Form Generation

Use `UniversalForm` to automatically generate forms:

```typescript
import { UniversalForm } from '@openfaith/ui'
import { Person } from '@openfaith/schema/directory/ofPersonSchema'

const CreatePersonForm = () => {
  return (
    <UniversalForm
      schema={Person} // System fields automatically filtered out
      onSubmit={(data) => console.log(data)}
      defaultValues={{
        status: 'active',
      }}
      fieldOverrides={{
        gender: {
          type: 'select',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
        birthdate: {
          type: 'date',
          placeholder: 'Select birthdate',
        },
      }}
    />
  )
}
```

The form will automatically include only user-facing fields, excluding all system fields marked as hidden.

## Consistency with Tables

The form generation system shares the same field filtering logic as table generation, ensuring consistent behavior:

- Fields hidden in forms are controlled by `field.hidden`
- Fields hidden in tables are controlled by `table.hidden`
- System fields are automatically filtered in both contexts
- The same schema annotations drive both table columns and form fields

## Quick Actions Integration

Forms integrate seamlessly with the quick actions system:

```typescript
import { CreatePersonQuickAction } from "@openfaith/openfaith/features/quickActions/createPersonQuickAction";

// The CreatePersonQuickAction uses UniversalForm with the Person schema
// All system fields are automatically filtered out
// Only user-facing fields like name, firstName, lastName, email, etc. are shown
```

This annotation-driven approach ensures that:

- **No manual field omission is needed** - the schema annotations drive everything
- **Consistent behavior** between tables and forms
- **Maintainable code** - adding new system fields only requires marking them as `hidden: true`
- **Type safety** - all field configurations are validated at compile time

---

# Original Form Generation Initiative (Implementation Details)

## Technical Approach

### 1. Schema Annotation System

#### Single UiConfig Annotation

```typescript
// packages/schema/src/ui/annotations.ts
export const UiConfig = Symbol.for("@openfaith/ui/Config");

export interface FieldConfig {
  field?: {
    // Field type is AUTO-DETECTED from schema - only override when needed
    type?:
      | "text"
      | "email"
      | "password"
      | "slug"
      | "textarea"
      | "number"
      | "select"
      | "combobox"
      | "singleCombobox"
      | "switch"
      | "date"
      | "datetime"
      | "tags"
      | "otp";
    label?: string;
    placeholder?: string;
    required?: boolean; // AUTO-DETECTED from schema optionality
    options?: Array<{ value: string; label: string }>; // AUTO-DETECTED from unions/literals
    rows?: number; // for textarea
    searchable?: boolean; // for combobox
    creatable?: boolean; // for tags/combobox
    multiple?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number;
  };
}
```

#### TypeScript Module Augmentation

```typescript
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [UiConfig]?: FieldConfig;
    }
  }
}
```

### 2. Enhanced Schema Definitions

#### Example: Person Schema with Form Annotations

```typescript
export const Person = Schema.Struct({
  firstName: Schema.String.annotations({
    description: "The first name of the person",
    [UiConfig]: {
      field: {
        // type: "text" - AUTO-DETECTED from Schema.String
        label: "First Name",
        placeholder: "Enter first name",
      },
    } satisfies FieldConfig,
  }),

  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "Invalid email address",
    }),
  ).annotations({
    [UiConfig]: {
      field: {
        // type: "email" - AUTO-DETECTED from email pattern
        label: "Email Address",
        placeholder: "Enter email address",
      },
    } satisfies FieldConfig,
  }),

  department: Schema.Literal(
    "Engineering",
    "Sales",
    "Marketing",
    "HR",
  ).annotations({
    [UiConfig]: {
      field: {
        // type: "select" - AUTO-DETECTED from Schema.Literal union
        // options: [...] - AUTO-DETECTED from literal values
        label: "Department",
        // Custom labels for options (auto-detected values would be same as labels)
        options: [
          { value: "Engineering", label: "Engineering" },
          { value: "Sales", label: "Sales" },
          { value: "Marketing", label: "Marketing" },
          { value: "HR", label: "Human Resources" },
        ],
      },
    } satisfies FieldConfig,
  }),

  bio: Schema.String.pipe(Schema.NullOr).annotations({
    [UiConfig]: {
      field: {
        type: "textarea", // Override auto-detection (would be "text")
        label: "Biography",
        placeholder: "Tell us about yourself...",
        rows: 4,
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
    } satisfies FieldConfig,
  }),
});
```

### 3. Form Generation Engine

#### Schema Introspection Utilities

```typescript
// packages/ui/src/form/schemaIntrospection.ts
import { Schema, SchemaAST } from "effect";
import { UiConfig, type FieldConfig } from "@openfaith/schema/ui/annotations";

export interface ExtractedField {
  key: string;
  schema: Schema.Schema.AnyNoContext;
  isOptional: boolean;
  isNullable: boolean;
}

export const extractSchemaFields = <T>(
  schema: Schema.Schema<T>,
): ExtractedField[] => {
  const ast = schema.ast;

  if (ast._tag !== "TypeLiteral") {
    throw new Error("Can only extract fields from Struct schemas");
  }

  return ast.propertySignatures.map((prop) => ({
    key: prop.name as string,
    schema: prop.type,
    isOptional: prop.isOptional,
    isNullable: isNullableSchema(prop.type),
  }));
};

const isNullableSchema = (schema: SchemaAST.AST): boolean => {
  if (schema._tag === "Union") {
    return schema.types.some((t) => t._tag === "NullKeyword");
  }
  return false;
};
```

#### Field Configuration Generator

```typescript
// packages/ui/src/form/fieldConfigGenerator.ts
export const generateFieldConfigs = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig["field"]>>> = {},
): Record<keyof T, Required<FieldConfig["field"]>> => {
  const fields = extractSchemaFields(schema);
  const result = {} as Record<keyof T, Required<FieldConfig["field"]>>;

  for (const field of fields) {
    const key = field.key as keyof T;

    // Get UI config from annotation
    const uiConfig = SchemaAST.getAnnotation<FieldConfig>(UiConfig)(
      field.schema,
    );
    const fieldConfig = uiConfig?.field;

    // Fallback to auto-detection if no config provided
    const autoConfig = fieldConfig || autoDetectFieldConfig(field.schema);

    // Apply defaults and overrides
    const finalConfig: Required<FieldConfig["field"]> = {
      type: "text",
      label: formatLabel(String(key)),
      placeholder: "",
      required: !field.isOptional && !field.isNullable,
      options: [],
      rows: 3,
      searchable: false,
      creatable: false,
      multiple: false,
      min: undefined,
      max: undefined,
      step: undefined,
      ...autoConfig,
      ...overrides[key],
    };

    result[key] = finalConfig;
  }

  return result;
};
```

#### Auto-Detection System

The system automatically detects field types from schema definitions, eliminating the need for explicit `type` annotations in most cases:

```typescript
const autoDetectFieldConfig = (
  schema: Schema.Schema.AnyNoContext,
  fieldName: string,
): Partial<FieldConfig["field"]> => {
  const ast = schema.ast;

  // 1. Schema type-based detection
  switch (ast._tag) {
    case "StringKeyword":
      // Check for email patterns in refinements
      if (hasEmailPattern(schema)) {
        return { type: "email" };
      }
      // Check field name patterns
      if (fieldName.toLowerCase().includes("password")) {
        return { type: "password" };
      }
      if (fieldName.toLowerCase().includes("slug")) {
        return { type: "slug" };
      }
      return { type: "text" };

    case "NumberKeyword":
      return { type: "number" };

    case "BooleanKeyword":
      return { type: "switch" };

    case "Union":
      // Auto-detect select options from literal unions
      if (ast.types.every((t) => t._tag === "Literal")) {
        const options = ast.types.map((t) => ({
          value: String(t.literal),
          label: String(t.literal),
        }));
        return { type: "select", options };
      }
      break;

    case "Array":
      return { type: "tags" };

    default:
      return { type: "text" };
  }

  return { type: "text" };
};

// Helper to detect email patterns in schema refinements
const hasEmailPattern = (schema: Schema.Schema.AnyNoContext): boolean => {
  // Check if schema has email validation pattern
  // Implementation would inspect schema refinements/filters
  return false; // Placeholder
};
```

**Auto-Detection Rules:**

1. **Schema.String** → `"text"` (default)

   - With email pattern → `"email"`
   - Field name contains "password" → `"password"`
   - Field name contains "slug" → `"slug"`

2. **Schema.Number** → `"number"`

3. **Schema.Boolean** → `"switch"`

4. **Schema.Literal unions** → `"select"` with auto-generated options

5. **Schema.Array** → `"tags"`

6. **Schema.NullOr/Optional** → Sets `required: false`

**Override Only When Needed:**

```typescript
// ✅ Good - minimal annotation, auto-detection handles the rest
bio: Schema.String.pipe(Schema.NullOr).annotations({
  [UiConfig]: {
    field: {
      type: "textarea", // Override: would be "text" by default
      rows: 4,
    },
  },
}),

// ❌ Avoid - unnecessary explicit type annotation
firstName: Schema.String.annotations({
  [UiConfig]: {
    field: {
      type: "text", // ❌ Redundant - auto-detected from Schema.String
      label: "First Name",
    },
  },
}),
```

### 4. Universal Form Component

#### Core Implementation

```typescript
// packages/ui/src/form/UniversalForm.tsx
import { useAppForm } from '@openfaith/ui/components/formFields/tsForm'
import { Schema } from 'effect'

export const UniversalForm = <T>({
  schema,
  defaultValues,
  onSubmit,
  fieldOverrides = {},
  className,
  children,
}: {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  children?: (form: ReturnType<typeof useAppForm<T>>, fields: Record<keyof T, FieldConfig['field']>) => React.ReactNode
}) => {
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  const form = useAppForm<T>({
    defaultValues: defaultValues ?? {} as T,
    onSubmit: async ({ value }) => {
      // Validate with Effect Schema before submitting
      const result = Schema.decodeUnknownEither(schema)(value)
      if (result._tag === 'Left') {
        console.error('Schema validation failed:', result.left)
        return
      }
      await onSubmit(result.right)
    },
  })

  if (children) {
    return (
      <div className={className}>
        {children(form, fieldConfigs)}
      </div>
    )
  }

  // Default auto-generated layout
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className={className}
    >
      <div className="space-y-4">
        {Object.entries(fieldConfigs).map(([key, config]) => (
          <form.Field
            key={key}
            name={key}
            validators={{
              onChange: createValidator(config, schema),
            }}
          >
            {(field) => {
              const Component = getFieldComponent(config.type)
              return (
                <Component
                  field={field}
                  label={config.label}
                  placeholder={config.placeholder}
                  required={config.required}
                  {...getComponentProps(config)}
                />
              )
            }}
          </form.Field>
        ))}
      </div>

      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => form.reset()}
          className="btn btn-secondary"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
```

#### Field Component Mapping

```typescript
// Map field types to existing UI components
const getFieldComponent = (fieldType: FieldConfig["field"]["type"]) => {
  const componentMap = {
    text: InputField,
    email: InputField,
    password: InputField,
    slug: SlugInputField,
    textarea: TextareaField,
    number: InputField,
    select: SelectField,
    combobox: ComboboxField,
    singleCombobox: SingleComboboxField,
    switch: SwitchField,
    date: DatePickerField,
    datetime: DateTimeField,
    tags: TagInputField,
    otp: OTPField,
  };

  return componentMap[fieldType] || InputField;
};
```

### 5. Validation Integration

#### Effect Schema Validation

```typescript
const createValidator = (
  config: FieldConfig["field"],
  schema: Schema.Schema<any>,
) => {
  return (value: any) => {
    // Basic required validation
    if (
      config.required &&
      (value === null || value === undefined || value === "")
    ) {
      return `${config.label} is required`;
    }

    // Type-specific validation
    if (config.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Invalid email address";
      }
    }

    if (config.type === "number" && value !== null && value !== undefined) {
      if (config.min !== undefined && value < config.min) {
        return `Must be at least ${config.min}`;
      }
      if (config.max !== undefined && value > config.max) {
        return `Must be at most ${config.max}`;
      }
    }

    return undefined;
  };
};
```

## Implementation Plan

### Week 1: Foundation

- [ ] **Day 1-2**: Create UI annotation types and symbols

  - Define `UiConfig` symbol and `FieldConfig` interface
  - Set up TypeScript module augmentation
  - Create basic annotation utilities

- [ ] **Day 3-4**: Build schema introspection utilities

  - Implement `extractSchemaFields` function
  - Create field type detection logic
  - Add auto-detection fallbacks

- [ ] **Day 5**: Create field configuration generator
  - Implement `generateFieldConfigs` function
  - Add override support
  - Test with existing Person schema

### Week 2: Form Generation

- [ ] **Day 1-2**: Implement UniversalForm component

  - Create basic form structure
  - Integrate with existing `useAppForm`
  - Add field component mapping

- [ ] **Day 3-4**: Add validation integration

  - Connect Effect Schema validation
  - Implement field-level validators
  - Add error handling and display

- [ ] **Day 5**: Testing and refinement
  - Test with various schema types
  - Add comprehensive error handling
  - Performance optimization

## File Structure

```
packages/
├── schema/
│   └── src/
│       └── ui/
│           └── annotations.ts          # UI annotation definitions
├── ui/
│   └── src/
│       └── form/
│           ├── UniversalForm.tsx       # Main form component
│           ├── schemaIntrospection.ts  # Schema parsing utilities
│           ├── fieldConfigGenerator.ts # Field config generation
│           └── validation.ts           # Validation utilities
└── shared/
    └── src/
        └── ui/
            └── formatters.ts           # Label formatting utilities
```

## Usage Examples

### 1. Fully Automatic Form

```typescript
const CreatePersonForm = () => (
  <UniversalForm
    schema={Person}
    onSubmit={(person) => createPerson(person)}
    className="max-w-2xl mx-auto p-6"
  />
)
```

### 2. Custom Layout with Field Access

```typescript
const CustomPersonForm = () => (
  <UniversalForm
    schema={Person}
    onSubmit={(person) => createPerson(person)}
    fieldOverrides={{
      bio: { rows: 6 },
      department: { searchable: true }
    }}
  >
    {(form, fields) => (
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="firstName" validators={{ onChange: fields.firstName.validation }}>
            {(field) => (
              <InputField
                field={field}
                label={fields.firstName.label}
                placeholder={fields.firstName.placeholder}
                required={fields.firstName.required}
              />
            )}
          </form.Field>

          <form.Field name="lastName" validators={{ onChange: fields.lastName.validation }}>
            {(field) => (
              <InputField
                field={field}
                label={fields.lastName.label}
                placeholder={fields.lastName.placeholder}
                required={fields.lastName.required}
              />
            )}
          </form.Field>
        </div>

        <button type="submit">Create Person</button>
      </form>
    )}
  </UniversalForm>
)
```

### 3. Override Specific Field Types

```typescript
const PersonFormWithOverrides = () => (
  <UniversalForm
    schema={Person}
    onSubmit={(person) => createPerson(person)}
    fieldOverrides={{
      bio: {
        type: 'textarea',
        rows: 4,
        placeholder: 'Tell us about this person...'
      },
      department: {
        type: 'singleCombobox',
        searchable: true
      }
    }}
  />
)
```

## Research References

### Effect Schema Documentation

- **Effect-MCP Search**: "Schema annotations AST introspection"

  - Focus on `SchemaAST.getAnnotation` usage patterns
  - Study annotation extraction from schema definitions
  - Understand AST traversal for field extraction

- **Effect-MCP Search**: "Schema AST getAnnotation introspection fields"
  - Learn about accessing field-level annotations
  - Understand property signature handling
  - Study type-safe annotation retrieval

### TanStack Form Integration

- **Context7 Search**: "tanstack form field types and validation"

  - Study field validation patterns
  - Understand error handling approaches
  - Learn about custom field components

- **Context7 Search**: "tanstack form react hook form integration"
  - Study form state management
  - Understand field registration patterns
  - Learn about form submission handling

### Inspiration Libraries

- **GitHub Repository Analysis**: https://github.com/inato/inato-form
  - Study `FormField.FormField` pattern for field definitions
  - Analyze `FormBody.struct` for hierarchical form structure
  - Review `FormDisplay.make` for auto-generation patterns
  - Examine Effect Layer system for dependency injection

## Success Metrics

### Developer Experience

- **Code Reduction**: 80% less boilerplate for standard forms
- **Type Safety**: 100% type safety from schema to form submission
- **Development Speed**: 3x faster form development

### Technical Metrics

- **Bundle Size Impact**: <25KB additional bundle size
- **Runtime Performance**: <5ms additional render time
- **Memory Usage**: <1MB additional memory footprint

### Quality Metrics

- **Test Coverage**: >90% test coverage for form generation
- **Error Handling**: Comprehensive error states and messages
- **Accessibility**: WCAG 2.1 AA compliance for generated forms

## Risk Mitigation

### Technical Risks

- **Complex Schema Types**: Mitigated by comprehensive auto-detection and fallbacks
- **Performance Impact**: Addressed through memoization and lazy loading
- **Type Safety**: Ensured through strict TypeScript configuration

### Adoption Risks

- **Learning Curve**: Minimized by building on existing TanStack Form patterns
- **Migration Complexity**: Addressed through gradual adoption strategy
- **Team Resistance**: Mitigated by clear benefits demonstration

## Next Steps

1. **Team Review**: Review and approve this specification
2. **Prototype Development**: Build proof-of-concept with Person schema
3. **Integration Testing**: Test with existing UI components
4. **Documentation**: Create comprehensive usage guides
5. **Team Training**: Conduct training sessions on new patterns
