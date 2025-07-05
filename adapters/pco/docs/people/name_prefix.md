Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](name_prefix.md)

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

# NamePrefix

A name prefix is one of Mr., Mrs., etc.

[# Example Request](#/apps/people/2025-03-20/vertices/name_prefix#example-request)

```
curl https://api.planningcenteronline.com/people/v2/name_prefixes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/name_prefixes)

[# Example Object](#/apps/people/2025-03-20/vertices/name_prefix#example-object)

```
{
  "type": "NamePrefix",
  "id": "1",
  "attributes": {
    "value": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/name_prefix#attributes)

Name

Type

Description

`id`

`primary_key`

`value`

`string`

[# URL Parameters](#/apps/people/2025-03-20/vertices/name_prefix#url-parameters)

# Order By

Parameter

Value

Type

Description

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

[# Endpoints](#/apps/people/2025-03-20/vertices/name_prefix#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/name_prefixes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/name_prefixes/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/name_prefixes`

Copy

* value

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/name_prefixes/{id}`

Copy

* value

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/name_prefixes/{id}`

Copy

[# Belongs To](#/apps/people/2025-03-20/vertices/name_prefix#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/name_prefixes`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/name_prefix`

Copy

[Person](person.md)