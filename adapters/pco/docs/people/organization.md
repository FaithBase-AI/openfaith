Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)

2025-03-20

Info

[Address](address.md)

[App](app.md)

[BackgroundCheck](background_check.md)

[BirthdayPeople](birthday_people.md)

[Campus](campus.md)

[Carrier](carrier.md)

[Condition](condition.md)

[ConnectedPerson](connected_person.md)

[CustomSender](custom_sender.md)

[Email](email.md)

[FieldDatum](field_datum.md)

[FieldDefinition](field_definition.md)

[FieldOption](field_option.md)

[Form](form.md)

[FormCategory](form_category.md)

[FormField](form_field.md)

[FormFieldOption](form_field_option.md)

[FormSubmission](form_submission.md)

[FormSubmissionValue](form_submission_value.md)

[Household](household.md)

[HouseholdMembership](household_membership.md)

[InactiveReason](inactive_reason.md)

[List](list.md)

[ListCategory](list_category.md)

[ListResult](list_result.md)

[ListShare](list_share.md)

[ListStar](list_star.md)

[MailchimpSyncStatus](mailchimp_sync_status.md)

[MaritalStatus](marital_status.md)

[Message](message.md)

[MessageGroup](message_group.md)

[NamePrefix](name_prefix.md)

[NameSuffix](name_suffix.md)

[Note](note.md)

[NoteCategory](note_category.md)

[NoteCategoryShare](note_category_share.md)

[NoteCategorySubscription](note_category_subscription.md)

[Organization](organization.md)

[OrganizationStatistics](organization_statistics.md)

[PeopleImport](people_import.md)

[PeopleImportConflict](people_import_conflict.md)

[PeopleImportHistory](people_import_history.md)

[Person](person.md)

[PersonApp](person_app.md)

[PersonMerger](person_merger.md)

[PhoneNumber](phone_number.md)

[PlatformNotification](platform_notification.md)

[Report](report.md)

[Rule](rule.md)

[SchoolOption](school_option.md)

[ServiceTime](service_time.md)

[SocialProfile](social_profile.md)

[SpamEmailAddress](spam_email_address.md)

[Tab](tab.md)

[Workflow](workflow.md)

[WorkflowCard](workflow_card.md)

[WorkflowCardActivity](workflow_card_activity.md)

[WorkflowCardNote](workflow_card_note.md)

[WorkflowCategory](workflow_category.md)

[WorkflowShare](workflow_share.md)

[WorkflowStep](workflow_step.md)

[WorkflowStepAssigneeSummary](workflow_step_assignee_summary.md)

[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Organization

The organization represents a single church. Every other resource is scoped to this record.

[# Example Request](#/apps/people/2025-03-20/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/people/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2)

[# Example Object](#/apps/people/2025-03-20/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "country_code": "string",
    "date_format": 1,
    "time_zone": "string",
    "contact_website": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "avatar_url": "string",
    "church_center_subdomain": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`country_code`

`string`

`date_format`

`integer`

`time_zone`

`string`

`contact_website`

`string`

`created_at`

`date_time`

`avatar_url`

`string`

`church_center_subdomain`

`string`

[# URL Parameters](#/apps/people/2025-03-20/vertices/organization#url-parameters)

# Pagination

Name

Parameter

Type

Description

per\_page

per\_page

integer

how many records to return per page (min=1, max=100, default=25)

offset

offset

integer

get results from given offset

[# Endpoints](#/apps/people/2025-03-20/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/organization#associations)

# addresses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/addresses`

Copy

[Address](address.md)

# apps

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/apps`

Copy

[App](app.md)

# background\_checks

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/background_checks`

Copy

[BackgroundCheck](background_check.md)

* `current` — filter background checks to only those considered "current"

# birthday\_people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/birthday_people`

Copy

[BirthdayPeople](birthday_people.md)

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/campuses`

Copy

[Campus](campus.md)

# carriers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/carriers`

Copy

[Carrier](carrier.md)

# emails

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/emails`

Copy

[Email](email.md)

# field\_data

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_data`

Copy

[FieldDatum](field_datum.md)

# field\_definitions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_definitions`

Copy

[FieldDefinition](field_definition.md)

* `include_deleted` — By default, deleted fields are not included. Pass filter=include\_deleted to include them.

# form\_categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/form_categories`

Copy

[FormCategory](form_category.md)

# forms

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms`

Copy

[Form](form.md)

* `archived`
* `closed`
* `not_archived`
* `open`
* `recently_viewed`
* `with_recoverable`

# households

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/households`

Copy

[Household](household.md)

# inactive\_reasons

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/inactive_reasons`

Copy

[InactiveReason](inactive_reason.md)

# list\_categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/list_categories`

Copy

[ListCategory](list_category.md)

# lists

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists`

Copy

[List](list.md)

* `can_manage`
* `recently_viewed`
* `starred`
* `unassigned`

# marital\_statuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/marital_statuses`

Copy

[MaritalStatus](marital_status.md)

# message\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/message_groups`

Copy

[MessageGroup](message_group.md)

# messages

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/messages`

Copy

[Message](message.md)

* `created_after`

# name\_prefixes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/name_prefixes`

Copy

[NamePrefix](name_prefix.md)

# name\_suffixes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/name_suffixes`

Copy

[NameSuffix](name_suffix.md)

# note\_categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/note_categories`

Copy

[NoteCategory](note_category.md)

* `view_creatable`

# note\_category\_subscriptions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/note_category_subscriptions`

Copy

[NoteCategorySubscription](note_category_subscription.md)

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/notes`

Copy

[Note](note.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people`

Copy

[Person](person.md)

* `admins`
* `created_since` — filter people created in the last 24 hours; pass an additional `time` parameter in ISO 8601 format to specify your own timeframe
* `organization_admins`

# people\_imports

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people_imports`

Copy

[PeopleImport](people_import.md)

# person\_mergers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/person_mergers`

Copy

[PersonMerger](person_merger.md)

# phone\_numbers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/phone_numbers`

Copy

[PhoneNumber](phone_number.md)

# reports

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/reports`

Copy

[Report](report.md)

# school\_options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/school_options`

Copy

[SchoolOption](school_option.md)

# social\_profiles

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/social_profiles`

Copy

[SocialProfile](social_profile.md)

# spam\_email\_addresses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/spam_email_addresses`

Copy

[SpamEmailAddress](spam_email_address.md)

# stats

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/stats`

Copy

[OrganizationStatistics](organization_statistics.md)

# tabs

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/tabs`

Copy

[Tab](tab.md)

* `with_field_definitions`

# workflows

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows`

Copy

[Workflow](workflow.md)

* `archived`
* `has_my_cards`
* `manage_cards_allowed`
* `not_archived`
* `only_deleted`
* `recently_viewed`
* `unassigned`
* `with_deleted`
* `with_recoverable`
* `with_steps`

[# Belongs To](#/apps/people/2025-03-20/vertices/organization#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/organization`

Copy

[Person](person.md)