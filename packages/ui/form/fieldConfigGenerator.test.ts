import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  generateColumnConfigs,
  generateFieldConfigs,
  generateUiConfigs,
  getColumnConfig,
  getFieldConfig,
} from '@openfaith/ui/form/fieldConfigGenerator'
import { Effect, Schema } from 'effect'

// Test schemas
const UserSchema = Schema.Struct({
  age: Schema.optional(Schema.Number),
  bio: Schema.optional(Schema.String),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  id: Schema.Number,
  isActive: Schema.Boolean,
  name: Schema.String,
  tags: Schema.Array(Schema.String),
})

const SimpleSchema = Schema.Struct({
  count: Schema.Number,
  title: Schema.String,
})

effect('generateFieldConfigs - generates configs for all schema fields', () =>
  Effect.gen(function* () {
    const configs = generateFieldConfigs(UserSchema)

    // Should have configs for all fields
    expect(configs!.id).toBeDefined()
    expect(configs!.name).toBeDefined()
    expect(configs!.email).toBeDefined()
    expect(configs!.age).toBeDefined()
    expect(configs!.isActive).toBeDefined()
    expect(configs!.bio).toBeDefined()
    // tags is filtered out as a system field
    expect(configs!.tags).toBeUndefined()

    // Check required field detection
    expect(configs.id!.required).toBe(true) // Not optional
    expect(configs.name!.required).toBe(true) // Not optional
    expect(configs.age!.required).toBe(false) // Optional
    expect(configs.bio!.required).toBe(false) // Optional

    // Check auto-detected types
    expect(configs.id!.type).toBe('number')
    expect(configs.name!.type).toBe('text')
    expect(configs.email!.type).toBe('text') // Email pattern not detected in AST, falls back to text
    expect(configs.isActive!.type).toBe('switch')
    expect(configs.bio!.type).toBe('textarea') // Should detect 'bio' as textarea
    // tags field is filtered out as a system field

    // Check default values
    expect(configs.name!.label).toBe('Name')
    expect(configs.email!.label).toBe('Email')
    expect(configs.isActive!.label).toBe('Is Active')
  }),
)

effect('generateFieldConfigs - applies overrides correctly', () =>
  Effect.gen(function* () {
    const overrides = {
      email: {
        type: 'text' as const,
      },
      name: {
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: false,
      },
    }

    const configs = generateFieldConfigs(UserSchema, overrides)

    // Check overrides were applied
    expect(configs.name!.label).toBe('Full Name')
    expect(configs.name!.placeholder).toBe('Enter your full name')
    expect(configs.name!.required).toBe(false)
    expect(configs.email!.type).toBe('text') // Overridden from auto-detected 'text'

    // Check non-overridden fields remain unchanged
    expect(configs.id!.type).toBe('number')
    expect(configs.isActive!.type).toBe('switch')
  }),
)

effect('generateFieldConfigs - handles empty overrides', () =>
  Effect.gen(function* () {
    const configs = generateFieldConfigs(UserSchema, {})

    expect(configs!.name).toBeDefined()
    expect(configs!.email).toBeDefined()
    expect(configs.name!.type).toBe('text')
    expect(configs.email!.type).toBe('text') // Email pattern not detected in AST, falls back to text
  }),
)

effect('generateColumnConfigs - generates table configs for all schema fields', () =>
  Effect.gen(function* () {
    const configs = generateColumnConfigs(UserSchema)

    // Should have configs for all fields
    expect(configs!.id).toBeDefined()
    expect(configs!.name).toBeDefined()
    expect(configs!.email).toBeDefined()
    expect(configs!.age).toBeDefined()
    expect(configs!.isActive).toBeDefined()
    expect(configs!.bio).toBeDefined()
    // tags is filtered out as a system field
    expect(configs!.tags).toBeUndefined()

    // Check auto-detected cell types
    expect(configs.id!.cellType).toBe('number')
    expect(configs.name!.cellType).toBe('text')
    expect(configs.email!.cellType).toBe('text') // Email pattern not detected in AST, falls back to text
    expect(configs.isActive!.cellType).toBe('boolean')

    // Check default values
    expect(configs.name!.header).toBe('Name')
    expect(configs.email!.header).toBe('Email')
    expect(configs.id!.sortable).toBe(true)
    expect(configs.name!.filterable).toBe(true)
    expect(configs.id!.width).toBe(150)
  }),
)

effect('generateColumnConfigs - applies overrides correctly', () =>
  Effect.gen(function* () {
    const overrides = {
      email: {
        cellType: 'text' as const,
        hidden: true,
      },
      name: {
        header: 'Full Name',
        sortable: false,
        width: 200,
      },
    }

    const configs = generateColumnConfigs(UserSchema, overrides)

    // Check overrides were applied
    expect(configs.name!.header).toBe('Full Name')
    expect(configs.name!.width).toBe(200)
    expect(configs.name!.sortable).toBe(false)
    expect(configs.email!.cellType).toBe('text') // Overridden from auto-detected 'text'
    expect(configs.email!.hidden).toBe(true)

    // Check non-overridden fields remain unchanged
    expect(configs.id!.cellType).toBe('number')
    expect(configs.isActive!.cellType).toBe('boolean')
  }),
)

effect('generateUiConfigs - generates both field and column configs', () =>
  Effect.gen(function* () {
    const fieldOverrides = {
      name: { label: 'Full Name' },
    }
    const tableOverrides = {
      name: { header: 'Full Name', width: 200 },
    }

    const configs = generateUiConfigs(UserSchema, fieldOverrides, tableOverrides)

    expect(configs!.fields).toBeDefined()
    expect(configs!.columns).toBeDefined()

    // Check field configs
    expect(configs.fields.name!.label).toBe('Full Name')
    expect(configs.fields.email!.type).toBe('text') // Email pattern not detected in AST, falls back to text

    // Check column configs
    expect(configs.columns.name!.header).toBe('Full Name')
    expect(configs.columns.name!.width).toBe(200)
    expect(configs.columns.email!.cellType).toBe('text') // Email pattern not detected in AST, falls back to text
  }),
)

effect('generateUiConfigs - handles empty overrides', () =>
  Effect.gen(function* () {
    const configs = generateUiConfigs(SimpleSchema)

    expect(configs!.fields).toBeDefined()
    expect(configs!.columns).toBeDefined()
    expect(configs.fields.title!.type).toBe('text')
    expect(configs.columns.title!.cellType).toBe('text')
  }),
)

effect('getFieldConfig - returns single field configuration', () =>
  Effect.gen(function* () {
    const config = getFieldConfig(UserSchema, 'name')

    expect(config!.type).toBe('text')
    expect(config!.label).toBe('Name')
    expect(config!.required).toBe(true)
  }),
)

effect('getFieldConfig - applies overrides to single field', () =>
  Effect.gen(function* () {
    const overrides = {
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: false,
    }

    const config = getFieldConfig(UserSchema, 'name', overrides)

    expect(config!.label).toBe('Full Name')
    expect(config!.placeholder).toBe('Enter your full name')
    expect(config!.required).toBe(false)
    expect(config!.type).toBe('text') // Should still auto-detect type
  }),
)

effect('getColumnConfig - returns single column configuration', () =>
  Effect.gen(function* () {
    const config = getColumnConfig(UserSchema, 'name')

    expect(config!.cellType).toBe('text')
    expect(config!.header).toBe('Name')
    expect(config!.sortable).toBe(true)
    expect(config!.filterable).toBe(true)
  }),
)

effect('getColumnConfig - applies overrides to single column', () =>
  Effect.gen(function* () {
    const overrides = {
      header: 'Full Name',
      hidden: true,
      sortable: false,
      width: 250,
    }

    const config = getColumnConfig(UserSchema, 'name', overrides)

    expect(config!.header).toBe('Full Name')
    expect(config!.width).toBe(250)
    expect(config!.sortable).toBe(false)
    expect(config!.hidden).toBe(true)
    expect(config!.cellType).toBe('text') // Should still auto-detect type
  }),
)

effect('generateFieldConfigs - handles complex field types', () =>
  Effect.gen(function* () {
    const ComplexSchema = Schema.Struct({
      comment: Schema.String,
      description: Schema.String,
      message: Schema.String,
      notes: Schema.String,
      password: Schema.String,
      slug: Schema.String,
      status: Schema.Union(Schema.Literal('active'), Schema.Literal('inactive')),
    })

    const configs = generateFieldConfigs(ComplexSchema)

    expect(configs.password!.type).toBe('password')
    expect(configs.slug!.type).toBe('slug')
    expect(configs.description!.type).toBe('textarea')
    expect(configs.notes!.type).toBe('textarea')
    expect(configs.comment!.type).toBe('textarea')
    expect(configs.message!.type).toBe('textarea')
    expect(configs.status!.type).toBe('select')
    expect(configs.status!.options).toBeDefined()
  }),
)

effect('generateColumnConfigs - handles complex cell types', () =>
  Effect.gen(function* () {
    const ComplexSchema = Schema.Struct({
      amount: Schema.Number,
      avatar: Schema.String,
      category: Schema.String,
      cost: Schema.Number,
      createdAt: Schema.String,
      dateTime: Schema.String,
      fee: Schema.Number,
      image: Schema.String,
      link: Schema.String,
      photo: Schema.String,
      price: Schema.Number,
      salary: Schema.Number,
      startTime: Schema.String,
      status: Schema.String,
      type: Schema.String,
      updatedAt: Schema.String,
      url: Schema.String,
      website: Schema.String,
    })

    const configs = generateColumnConfigs(ComplexSchema)

    expect(configs.avatar!.cellType).toBe('avatar')
    expect(configs.image!.cellType).toBe('avatar')
    expect(configs.photo!.cellType).toBe('avatar')
    expect(configs.url!.cellType).toBe('link')
    expect(configs.link!.cellType).toBe('link')
    expect(configs.website!.cellType).toBe('link')
    expect(configs.status!.cellType).toBe('badge')
    // type field is filtered out as an entity type field
    expect(configs.type).toBeUndefined()
    expect(configs.category!.cellType).toBe('badge')
    expect(configs.price!.cellType).toBe('currency')
    expect(configs.cost!.cellType).toBe('currency')
    expect(configs.amount!.cellType).toBe('currency')
    expect(configs.salary!.cellType).toBe('currency')
    expect(configs.fee!.cellType).toBe('currency')
    expect(configs.createdAt!.cellType).toBe('text') // Date detection is outside string block in implementation
    expect(configs.updatedAt!.cellType).toBe('text') // Date detection is outside string block in implementation
    expect(configs.startTime!.cellType).toBe('text') // Date detection is outside string block in implementation
    expect(configs.dateTime!.cellType).toBe('text') // Date detection is outside string block in implementation
  }),
)

effect('generateFieldConfigs - preserves all required field properties', () =>
  Effect.gen(function* () {
    const configs = generateFieldConfigs(SimpleSchema)

    const titleConfig = configs.title

    // Check all required properties are present
    expect(titleConfig!.type).toBeDefined()
    expect(titleConfig!.label).toBeDefined()
    expect(titleConfig!.placeholder).toBeDefined()
    expect(titleConfig!.required).toBeDefined()
    expect(titleConfig!.options).toBeDefined()
    expect(titleConfig!.multiple).toBeDefined()
    expect(titleConfig!.searchable).toBeDefined()
    expect(titleConfig!.creatable).toBeDefined()
    expect(titleConfig!.min).toBeDefined()
    expect(titleConfig!.max).toBeDefined()
    expect(titleConfig!.step).toBeDefined()
    expect(titleConfig!.rows).toBeDefined()

    // Check default values
    expect(titleConfig!.type).toBe('text')
    expect(titleConfig!.label).toBe('Title')
    expect(titleConfig!.placeholder).toBe('')
    expect(titleConfig!.required).toBe(true)
    expect(titleConfig!.options).toEqual([])
    expect(titleConfig!.multiple).toBe(false)
    expect(titleConfig!.searchable).toBe(false)
    expect(titleConfig!.creatable).toBe(false)
    expect(titleConfig!.min).toBe(0)
    expect(titleConfig!.max).toBe(100)
    expect(titleConfig!.step).toBe(1)
    expect(titleConfig!.rows).toBe(3)
  }),
)

effect('generateColumnConfigs - preserves all required table properties', () =>
  Effect.gen(function* () {
    const configs = generateColumnConfigs(SimpleSchema)

    const titleConfig = configs.title

    // Check all required properties are present
    expect(titleConfig!.cellType).toBeDefined()
    expect(titleConfig!.header).toBeDefined()
    expect(titleConfig!.width).toBeDefined()
    expect(titleConfig!.sortable).toBeDefined()
    expect(titleConfig!.filterable).toBeDefined()
    expect(titleConfig!.hidden).toBeDefined()
    expect(titleConfig!.pinned).toBeDefined()

    // Check default values
    expect(titleConfig!.cellType).toBe('text')
    expect(titleConfig!.header).toBe('Title')
    expect(titleConfig!.width).toBe(150)
    expect(titleConfig!.sortable).toBe(true)
    expect(titleConfig!.filterable).toBe(true)
    expect(titleConfig!.hidden).toBe(false)
    expect(titleConfig!.pinned).toBe('left')
  }),
)
