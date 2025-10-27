import { HttpClient, HttpClientResponse } from '@effect/platform'
import { Effect, Layer, pipe, String } from 'effect'

const responseLookup = {
  '/people/v2/campuses': {
    data: [
      {
        attributes: {
          avatar_url: null,
          church_center_enabled: true,
          city: 'Braintree',
          contact_email_address: null,
          country: 'US',
          created_at: '2020-05-03T16:11:52Z',
          date_format: null,
          description: null,
          geolocation_set_manually: false,
          latitude: '42.2116041',
          longitude: '-71.0236303',
          name: 'Yeet Building',
          phone_number: null,
          state: 'Massachusetts',
          street: '440 West St.',
          time_zone: 'America/Los_Angeles',
          twenty_four_hour_time: null,
          updated_at: '2025-10-14T21:43:09Z',
          website: null,
          zip: '02184',
        },
        id: '46838',
        links: {
          self: 'https://api.planningcenteronline.com/people/v2/campuses/46838',
        },
        relationships: {
          organization: {
            data: {
              id: '361920',
              type: 'Organization',
            },
          },
        },
        type: 'Campus',
      },
    ],
    included: [],
    links: {
      self: 'https://api.planningcenteronline.com/people/v2/campuses?per_page=1',
    },
    meta: {
      can_include: ['lists', 'service_times'],
      can_order_by: ['name', 'created_at', 'updated_at'],
      can_query_by: ['created_at', 'updated_at', 'id'],
      count: 1,
      parent: {
        id: '361920',
        type: 'Organization',
      },
      total_count: 3,
    },
  },
  '/people/v2/people': {
    data: [
      {
        attributes: {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/PP.png',
          birthdate: null,
          can_create_forms: false,
          can_email_lists: false,
          child: false,
          created_at: '2024-12-18T13:51:40Z',
          demographic_avatar_url:
            'https://avatars.planningcenteronline.com/uploads/initials/PP.png',
          directory_status: 'no_access',
          first_name: 'Peter',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'Pogenpoel',
          login_identifier: null,
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'Peter Pogenpoel',
          nickname: null,
          passed_background_check: true,
          people_permissions: null,
          remote_id: null,
          resource_permission_flags: {
            can_access_workflows: false,
          },
          school_type: null,
          site_administrator: false,
          status: 'active',
          updated_at: '2024-12-18T13:51:45Z',
        },
        id: '160290623',
        links: {
          html: 'https://people.planningcenteronline.com/people/AC160290623',
          self: 'https://api.planningcenteronline.com/people/v2/people/160290623',
        },
        relationships: {
          addresses: {
            data: [
              {
                id: '120336451',
                type: 'Address',
              },
            ],
            links: {
              related: 'https://api.planningcenteronline.com/people/v2/people/160290623/addresses',
            },
          },
          emails: {
            data: [
              {
                id: '103797231',
                type: 'Email',
              },
            ],
            links: {
              related: 'https://api.planningcenteronline.com/people/v2/people/160290623/emails',
            },
          },
          gender: {
            data: null,
          },
          phone_numbers: {
            data: [
              {
                id: '117128151',
                type: 'PhoneNumber',
              },
            ],
            links: {
              related:
                'https://api.planningcenteronline.com/people/v2/people/160290623/phone_numbers',
            },
          },
          primary_campus: {
            data: {
              id: '46838',
              type: 'PrimaryCampus',
            },
          },
        },
        type: 'Person',
      },
    ],
    included: [
      {
        attributes: {
          address: 'peter@gmail.com',
          blocked: true,
          created_at: '2024-12-18T13:51:40Z',
          location: 'Home',
          primary: true,
          updated_at: '2024-12-18T13:51:40Z',
        },
        id: '103797231',
        links: {
          self: 'https://api.planningcenteronline.com/people/v2/emails/103797231',
        },
        relationships: {
          person: {
            data: {
              id: '160290623',
              type: 'Person',
            },
          },
        },
        type: 'Email',
      },
      {
        attributes: {
          city: 'Washington',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2024-12-18T13:51:40Z',
          location: 'Home',
          primary: true,
          state: 'DC',
          street_line_1: 'Independence Ave SW',
          street_line_2: '5',
          updated_at: '2024-12-18T13:51:40Z',
          zip: '20004',
        },
        id: '120336451',
        links: {
          self: 'https://api.planningcenteronline.com/people/v2/addresses/120336451',
        },
        relationships: {
          person: {
            data: {
              id: '160290623',
              type: 'Person',
            },
          },
        },
        type: 'Address',
      },
      {
        attributes: {
          carrier: null,
          country_code: 'US',
          created_at: '2024-12-18T13:51:40Z',
          e164: '+12825658985',
          international: '+1 282-565-8985',
          location: 'Mobile',
          national: '(282) 565-8985',
          number: '2825658985',
          primary: true,
          updated_at: '2024-12-18T13:51:40Z',
        },
        id: '117128151',
        links: {
          self: 'https://api.planningcenteronline.com/people/v2/phone_numbers/117128151',
        },
        relationships: {
          person: {
            data: {
              id: '160290623',
              type: 'Person',
            },
          },
        },
        type: 'PhoneNumber',
      },
    ],
    links: {
      self: 'https://api.planningcenteronline.com/people/v2/people?include=emails%2Caddresses%2Cphone_numbers&per_page=1',
    },
    meta: {
      can_filter: ['created_since', 'admins', 'organization_admins'],
      can_include: [
        'addresses',
        'emails',
        'field_data',
        'households',
        'inactive_reason',
        'marital_status',
        'name_prefix',
        'name_suffix',
        'organization',
        'person_apps',
        'phone_numbers',
        'platform_notifications',
        'primary_campus',
        'school',
        'social_profiles',
      ],
      can_order_by: [
        'accounting_administrator',
        'anniversary',
        'birthdate',
        'child',
        'given_name',
        'grade',
        'graduation_year',
        'middle_name',
        'nickname',
        'people_permissions',
        'site_administrator',
        'gender',
        'inactivated_at',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
        'remote_id',
        'membership',
        'status',
      ],
      can_query_by: [
        'accounting_administrator',
        'anniversary',
        'birthdate',
        'child',
        'given_name',
        'grade',
        'graduation_year',
        'middle_name',
        'nickname',
        'people_permissions',
        'site_administrator',
        'gender',
        'inactivated_at',
        'medical_notes',
        'membership',
        'created_at',
        'updated_at',
        'search_name',
        'search_name_or_email',
        'search_name_or_email_or_phone_number',
        'search_phone_number',
        'search_phone_number_e164',
        'mfa_configured',
        'first_name',
        'last_name',
        'id',
        'primary_campus_id',
        'remote_id',
        'status',
      ],
      count: 1,
      parent: {
        id: '361920',
        type: 'Organization',
      },
      total_count: 1,
    },
  },
  '/services/v2/teams': {
    data: [
      {
        attributes: {
          archived_at: null,
          assigned_directly: true,
          created_at: '2020-05-04T12:18:14Z',
          default_prepare_notifications: true,
          default_status: 'U',
          last_plan_from: 'organization',
          name: 'Audio/Visual',
          rehearsal_team: true,
          schedule_to: 'plan',
          secure_team: false,
          sequence: null,
          stage_color: 'orange',
          stage_variant: null,
          updated_at: '2021-03-09T02:48:32Z',
          viewers_see: 2,
        },
        id: '4056636',
        links: {
          self: 'https://api.planningcenteronline.com/services/v2/teams/4056636',
        },
        relationships: {
          default_responds_to: {
            data: {
              id: '76201458',
              type: 'Person',
            },
          },
          people: {
            data: [
              {
                id: '76201466',
                type: 'Person',
              },
              {
                id: '80245565',
                type: 'Person',
              },
              {
                id: '120854419',
                type: 'Person',
              },
            ],
            links: {
              related: 'https://api.planningcenteronline.com/services/v2/teams/4056636/people',
            },
          },
          service_type: {
            data: {
              id: '1040112',
              type: 'ServiceType',
            },
          },
          service_types: {
            data: [
              {
                id: '1040112',
                type: 'ServiceType',
              },
            ],
          },
        },
        type: 'Team',
      },
    ],
    included: [
      {
        attributes: {
          access_media_attachments: true,
          access_plan_attachments: true,
          access_song_attachments: true,
          anniversary: null,
          archived: false,
          archived_at: null,
          assigned_to_rehearsal_team: true,
          birthdate: null,
          created_at: '2020-05-04T13:06:09Z',
          facebook_id: null,
          first_name: 'Amy',
          full_name: 'Amy Filmalter',
          given_name: null,
          ical_code: 'PC2SLvpUUHIVURXTPEDgvFtXtHluM5dq13865630',
          last_name: 'Filmalter',
          legacy_id: '13865630',
          logged_in_at: null,
          max_permissions: 'Scheduled Viewer',
          max_plan_permissions: 'Scheduled Viewer',
          media_permissions: 'Scheduled Viewer',
          middle_name: null,
          name_prefix: null,
          name_suffix: null,
          nickname: null,
          notes: null,
          passed_background_check: false,
          permissions: 'Scheduled Viewer',
          photo_thumbnail_url:
            'https://avatars.planningcenteronline.com/uploads/initials/AF.png?g=224x224%23',
          photo_url: 'https://avatars.planningcenteronline.com/uploads/initials/AF.png',
          praise_charts_enabled: false,
          preferred_app: 'services',
          preferred_max_plans_per_day: null,
          preferred_max_plans_per_month: null,
          site_administrator: false,
          song_permissions: 'Scheduled Viewer',
          status: 'active',
          updated_at: '2025-05-27T20:52:15Z',
        },
        id: '76201466',
        links: {
          html: 'https://services.planningcenteronline.com/people/AC76201466',
          self: 'https://api.planningcenteronline.com/services/v2/people/76201466',
        },
        relationships: {
          created_by: {
            data: {
              id: '76201458',
              type: 'Person',
            },
          },
          current_folder: {
            data: {
              id: '0',
              type: 'Folder',
            },
          },
          updated_by: {
            data: {
              id: '76201466',
              type: 'Person',
            },
          },
        },
        type: 'Person',
      },
      {
        attributes: {
          access_media_attachments: true,
          access_plan_attachments: true,
          access_song_attachments: true,
          anniversary: null,
          archived: false,
          archived_at: null,
          assigned_to_rehearsal_team: true,
          birthdate: null,
          created_at: '2022-07-01T14:54:17Z',
          facebook_id: null,
          first_name: 'Yeet',
          full_name: 'Yeet Person',
          given_name: null,
          ical_code: 'PCkMr3xmKFRhZ6GhwPloqfnb34iMgxjf16509052',
          last_name: 'Person',
          legacy_id: '16509052',
          logged_in_at: null,
          max_permissions: 'Administrator',
          max_plan_permissions: 'Administrator',
          media_permissions: 'Administrator',
          middle_name: null,
          name_prefix: null,
          name_suffix: null,
          nickname: null,
          notes: null,
          passed_background_check: false,
          permissions: 'Administrator',
          photo_thumbnail_url:
            'https://avatars.planningcenteronline.com/uploads/initials/YP.png?g=224x224%23',
          photo_url: 'https://avatars.planningcenteronline.com/uploads/initials/YP.png',
          praise_charts_enabled: false,
          preferred_app: 'services',
          preferred_max_plans_per_day: null,
          preferred_max_plans_per_month: null,
          site_administrator: true,
          song_permissions: 'Administrator',
          status: 'active',
          updated_at: '2025-09-09T10:45:40Z',
        },
        id: '80245565',
        links: {
          html: 'https://services.planningcenteronline.com/people/AC80245565',
          self: 'https://api.planningcenteronline.com/services/v2/people/80245565',
        },
        relationships: {
          created_by: {
            data: {
              id: '76201458',
              type: 'Person',
            },
          },
          current_folder: {
            data: {
              id: '0',
              type: 'Folder',
            },
          },
          updated_by: {
            data: {
              id: '80245565',
              type: 'Person',
            },
          },
        },
        type: 'Person',
      },
      {
        attributes: {
          access_media_attachments: true,
          access_plan_attachments: true,
          access_song_attachments: true,
          anniversary: null,
          archived: false,
          archived_at: null,
          assigned_to_rehearsal_team: true,
          birthdate: '1997-03-27',
          created_at: '2024-01-24T19:18:18Z',
          facebook_id: null,
          first_name: 'Wayne',
          full_name: 'Wayne Cloud Filmalter',
          given_name: null,
          ical_code: 'PCRUuhy2g7lBuQyg32CxgE0YsJKmPoyn18998300',
          last_name: 'Filmalter',
          legacy_id: '18998300',
          logged_in_at: '2025-05-15T19:02:28Z',
          max_permissions: 'Administrator',
          max_plan_permissions: 'Administrator',
          media_permissions: 'Administrator',
          middle_name: 'Cloud',
          name_prefix: null,
          name_suffix: null,
          nickname: null,
          notes: null,
          passed_background_check: false,
          permissions: 'Administrator',
          photo_thumbnail_url:
            'https://avatars.planningcenteronline.com/uploads/person/120854419-1675348479/avatar.1.jpg?g=224x224%23',
          photo_url:
            'https://avatars.planningcenteronline.com/uploads/person/120854419-1675348479/avatar.1.jpg',
          praise_charts_enabled: false,
          preferred_app: 'services',
          preferred_max_plans_per_day: null,
          preferred_max_plans_per_month: null,
          site_administrator: true,
          song_permissions: 'Administrator',
          status: 'active',
          updated_at: '2024-10-09T11:32:11Z',
        },
        id: '120854419',
        links: {
          html: 'https://services.planningcenteronline.com/people/AC120854419',
          self: 'https://api.planningcenteronline.com/services/v2/people/120854419',
        },
        relationships: {
          created_by: {
            data: null,
          },
          current_folder: {
            data: {
              id: '1040787',
              type: 'Folder',
            },
          },
          updated_by: {
            data: {
              id: '120854419',
              type: 'Person',
            },
          },
        },
        type: 'Person',
      },
    ],
    links: {
      self: 'https://api.planningcenteronline.com/services/v2/teams?include=people&per_page=1',
    },
    meta: {
      can_filter: ['editable', 'service_types'],
      can_include: [
        'people',
        'person_team_position_assignments',
        'service_types',
        'team_leaders',
        'team_positions',
      ],
      can_order_by: ['name', 'created_at', 'updated_at'],
      can_query_by: ['name', 'service_type_id'],
      count: 1,
      parent: {
        id: '361920',
        type: 'Organization',
      },
      total_count: 42,
    },
  },
}

/**
 * Creates a mock PCO entity response with empty attributes
 * This allows you to fill in mock data later as needed
 */
const mkMockPcoResponse = <EntityType extends string>(params: {
  entityType: EntityType
  id?: string
  isCollection?: boolean
}) => {
  const entity = {
    attributes: {},
    id: params.id ?? '1',
    links: {},
    type: params.entityType,
  }

  if (params.isCollection) {
    return {
      data: [entity],
      included: [],
      links: {
        self: 'https://api.planningcenteronline.com/mock',
      },
      meta: {
        can_include: [],
        count: 1,
        total_count: 1,
      },
    }
  }

  return {
    data: entity,
    included: [],
  }
}

/**
 * Mock HttpClient for PCO API
 * Returns custom mock data from responseLookup if available, otherwise returns empty entities
 */
const mockPcoHttpClient = HttpClient.make(
  Effect.fn('mockPcoHttpClient')(function* (request) {
    const url = new URL(request.url)

    // First, try to find a matching response in the lookup table
    // Check if there's a direct match for the base path (without query params)
    const lookupResponse = pipe(
      responseLookup as Record<string, unknown>,
      (lookup) => lookup[url.pathname],
    )

    if (lookupResponse) {
      // Found a match in the lookup table, return it
      return HttpClientResponse.fromWeb(
        request,
        new Response(JSON.stringify(lookupResponse), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      )
    }

    // No match found, fallback to generating a mock response
    // Parse the URL to determine entity type and if it's a collection
    const pathParts = pipe(url.pathname, String.split('/'), (parts) =>
      parts.filter((part) => part !== ''),
    )
    const entityPath = pathParts[pathParts.length - 1]
    const isCollection = !entityPath || Number.isNaN(Number(entityPath))

    // Extract entity type from the last path segment (e.g., "/people/v2/addresses" -> "addresses")
    // Check for the resource name in the URL path, prioritizing more specific matches
    let entityType = 'Person'
    if (pipe(url.pathname, String.includes('webhook_subscriptions'))) {
      entityType = 'WebhookSubscription'
    } else if (pipe(url.pathname, String.includes('phone_numbers'))) {
      entityType = 'PhoneNumber'
    } else if (pipe(url.pathname, String.includes('addresses'))) {
      entityType = 'Address'
    } else if (pipe(url.pathname, String.includes('campuses'))) {
      entityType = 'Campus'
    } else if (pipe(url.pathname, String.includes('/groups'))) {
      entityType = 'Group'
    } else if (pipe(url.pathname, String.includes('/teams'))) {
      entityType = 'Team'
    } else if (pipe(url.pathname, String.includes('/people'))) {
      entityType = 'Person'
    }

    // Generate appropriate mock response
    const mockData = mkMockPcoResponse({
      entityType,
      id: !isCollection ? entityPath : undefined,
      isCollection,
    })

    return HttpClientResponse.fromWeb(
      request,
      new Response(JSON.stringify(mockData), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    )
  }),
)

/**
 * Layer that provides a mock HttpClient for testing
 * Use this layer to mock HTTP requests to the PCO API
 *
 * @example
 * ```typescript
 * import { HttpClient } from '@effect/platform'
 * import { effect } from '@openfaith/bun-test'
 * import { MockPcoHttpClientLayer } from '@openfaith/pco/api/pcoMockClient'
 *
 * effect('test with mock PCO HTTP client', () =>
 *   Effect.gen(function* () {
 *     const client = yield* HttpClient.HttpClient
 *     const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people')
 *     const json = yield* response.json
 *     expect(json.data).toHaveLength(1)
 *   }).pipe(Effect.provide(MockPcoHttpClientLayer))
 * )
 * ```
 */
export const MockPcoHttpClientLayer = Layer.succeed(HttpClient.HttpClient, mockPcoHttpClient)
