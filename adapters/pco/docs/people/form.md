Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](form.md)

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

# Form

A custom form for people to fill out.

[# Example Request](#/apps/people/2025-03-20/vertices/form#example-request)

```
curl https://api.planningcenteronline.com/people/v2/forms
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/forms)

[# Example Object](#/apps/people/2025-03-20/vertices/form#example-object)

```
{
  "type": "Form",
  "id": "1",
  "attributes": {
    "name": "string",
    "description": "string",
    "active": true,
    "archived_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "deleted_at": "2000-01-01T12:00:00Z",
    "submission_count": 1,
    "public_url": "string",
    "recently_viewed": true,
    "archived": true,
    "send_submission_notification_to_submitter": true,
    "login_required": true
  },
  "relationships": {
    "campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    },
    "form_category": {
      "data": {
        "type": "FormCategory",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/form#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`description`

`string`

`active`

`boolean`

`archived_at`

`date_time`

`created_at`

`date_time`

`updated_at`

`date_time`

`deleted_at`

`date_time`

`submission_count`

`integer`

`public_url`

`string`

`recently_viewed`

`boolean`

`archived`

`boolean`

`send_submission_notification_to_submitter`

`boolean`

`login_required`

`boolean`

[# Relationships](#/apps/people/2025-03-20/vertices/form#relationships)

Name

Type

Association Type

Note

campus

Campus

to\_one

form\_category

FormCategory

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/form#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

campus

include associated campus

create and update

include

category

include associated category

# Order By

Parameter

Value

Type

Description

order

active

string

prefix with a hyphen (-active) to reverse the order

order

archived\_at

string

prefix with a hyphen (-archived\_at) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

deleted\_at

string

prefix with a hyphen (-deleted\_at) to reverse the order

order

description

string

prefix with a hyphen (-description) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

active

where[active]

boolean

Query on a specific active

`?where[active]=true`

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/form#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/forms`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/forms/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/form#associations)

# campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms/{form_id}/campus`

Copy

[Campus](campus.md)

# category

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms/{form_id}/category`

Copy

[FormCategory](form_category.md)

# fields

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms/{form_id}/fields`

Copy

[FormField](form_field.md)

# form\_submissions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms/{form_id}/form_submissions`

Copy

[FormSubmission](form_submission.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/form#belongs-to)

# FormSubmission

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms/{form_id}/form_submissions/{form_submission_id}/form`

Copy

[FormSubmission](form_submission.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms`

Copy

[Organization](organization.md)

* `archived`
* `closed`
* `not_archived`
* `open`
* `recently_viewed`
* `with_recoverable`