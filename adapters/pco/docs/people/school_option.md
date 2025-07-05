Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](school_option.md)

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

# SchoolOption

A school option represents a school name, school type, grades, etc. and can be selected for a person.

[# Example Request](#/apps/people/2025-03-20/vertices/school_option#example-request)

```
curl https://api.planningcenteronline.com/people/v2/school_options
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/school_options)

[# Example Object](#/apps/people/2025-03-20/vertices/school_option#example-object)

```
{
  "type": "SchoolOption",
  "id": "1",
  "attributes": {
    "value": "string",
    "sequence": 1,
    "beginning_grade": "string",
    "ending_grade": "string",
    "school_types": []
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/school_option#attributes)

Name

Type

Description

`id`

`primary_key`

`value`

`string`

`sequence`

`integer`

`beginning_grade`

`string`

`ending_grade`

`string`

`school_types`

`array`

[# URL Parameters](#/apps/people/2025-03-20/vertices/school_option#url-parameters)

# Order By

Parameter

Value

Type

Description

order

beginning\_grade

string

prefix with a hyphen (-beginning\_grade) to reverse the order

order

ending\_grade

string

prefix with a hyphen (-ending\_grade) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

order

value

string

prefix with a hyphen (-value) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

beginning\_grade

where[beginning\_grade]

string

Query on a specific beginning\_grade

`?where[beginning_grade]=string`

ending\_grade

where[ending\_grade]

string

Query on a specific ending\_grade

`?where[ending_grade]=string`

school\_types

where[school\_types]

array

Query on a specific school\_types

`?where[school_types]=[]`

sequence

where[sequence]

integer

Query on a specific sequence

`?where[sequence]=1`

value

where[value]

string

Query on a specific value

`?where[value]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/school_option#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/school_options`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/school_options/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/school_options`

Copy

* value
* sequence
* beginning\_grade
* ending\_grade
* school\_types

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/school_options/{id}`

Copy

* value
* sequence
* beginning\_grade
* ending\_grade
* school\_types

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/school_options/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/school_option#associations)

# promotes\_to\_school

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/school_options/{school_option_id}/promotes_to_school`

Copy

[SchoolOption](school_option.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/school_option#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/school_options`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/school`

Copy

[Person](person.md)

# SchoolOption

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/school_options/{school_option_id}/promotes_to_school`

Copy

[SchoolOption](school_option.md)