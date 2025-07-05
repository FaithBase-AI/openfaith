Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](background_check.md)

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

# BackgroundCheck

Background Checks for a Person

[# Example Request](#/apps/people/2025-03-20/vertices/background_check#example-request)

```
curl https://api.planningcenteronline.com/people/v2/background_checks
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/background_checks)

[# Example Object](#/apps/people/2025-03-20/vertices/background_check#example-object)

```
{
  "type": "BackgroundCheck",
  "id": "1",
  "attributes": {
    "current": true,
    "note": "string",
    "status_updated_at": "2000-01-01T12:00:00Z",
    "report_url": "string",
    "expires_on": "2000-01-01",
    "status": "string",
    "completed_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/background_check#attributes)

Name

Type

Description

Note

`id`

`primary_key`

`current`

`boolean`

`note`

`string`

`status_updated_at`

`date_time`

`report_url`

`string`

This URL should require authentication

`expires_on`

`date`

Leave blank to use organization's expiration policy

`status`

`string`

Possible values: `awaiting_applicant`, `expired_invitation`, `report_processing`, `needs_review`, `complete_clear`, `complete_not_clear`, `canceled`

`completed_at`

`date_time`

Leave blank for current date and time

[# Relationships](#/apps/people/2025-03-20/vertices/background_check#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/background_check#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

person

include associated person

create and update

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

[# Endpoints](#/apps/people/2025-03-20/vertices/background_check#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/background_checks`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/background_checks/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/background_checks`

Copy

* note
* status
* report\_url
* expires\_on
* completed\_at

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/background_checks/{id}`

Copy

* note
* status
* report\_url

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/background_checks/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/background_check#associations)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/background_checks/{background_check_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/background_check#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/background_checks`

Copy

[Organization](organization.md)

* `current` — filter background checks to only those considered "current"

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/background_checks`

Copy

[Person](person.md)