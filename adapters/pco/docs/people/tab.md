Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](tab.md)

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

# Tab

A tab is a custom tab and groups like field definitions.

[# Example Request](#/apps/people/2025-03-20/vertices/tab#example-request)

```
curl https://api.planningcenteronline.com/people/v2/tabs
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/tabs)

[# Example Object](#/apps/people/2025-03-20/vertices/tab#example-object)

```
{
  "type": "Tab",
  "id": "1",
  "attributes": {
    "name": "string",
    "sequence": 1,
    "slug": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/tab#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`sequence`

`integer`

`slug`

`string`

[# URL Parameters](#/apps/people/2025-03-20/vertices/tab#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

field\_definitions

include associated field\_definitions

include

field\_options

include associated field\_options

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

order

slug

string

prefix with a hyphen (-slug) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

name

where[name]

string

Query on a specific name

`?where[name]=string`

sequence

where[sequence]

integer

Query on a specific sequence

`?where[sequence]=1`

slug

where[slug]

string

Query on a specific slug

`?where[slug]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/tab#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/tabs`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/tabs/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/tabs`

Copy

* name
* sequence

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/tabs/{id}`

Copy

* name
* sequence

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/tabs/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/tab#associations)

# field\_definitions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/tabs/{tab_id}/field_definitions`

Copy

[FieldDefinition](field_definition.md)

* `with_deleted`

# field\_options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/tabs/{tab_id}/field_options`

Copy

[FieldOption](field_option.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/tab#belongs-to)

# FieldDatum

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/tab`

Copy

[FieldDatum](field_datum.md)

# FieldDefinition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_definitions/{field_definition_id}/tab`

Copy

[FieldDefinition](field_definition.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/tabs`

Copy

[Organization](organization.md)

* `with_field_definitions`