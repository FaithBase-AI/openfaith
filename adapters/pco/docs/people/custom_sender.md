Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](custom_sender.md)

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

# CustomSender

A custom sender that can be used when sending emails.

[# Example Request](#/apps/people/2025-03-20/vertices/custom_sender#example-request)

```
curl https://api.planningcenteronline.com/people/v2/custom_senders
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/custom_senders)

[# Example Object](#/apps/people/2025-03-20/vertices/custom_sender#example-object)

```
{
  "type": "CustomSender",
  "id": "1",
  "attributes": {
    "name": "string",
    "email_address": "string",
    "verified_at": "2000-01-01T12:00:00Z",
    "verification_requested_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "verified": true,
    "expired": true,
    "verification_status": "string"
  },
  "relationships": {
    "custom_sender_shares": {
      "data": {
        "type": "CustomSenderShare",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/custom_sender#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`email_address`

`string`

`verified_at`

`date_time`

`verification_requested_at`

`date_time`

`created_at`

`date_time`

`updated_at`

`date_time`

`verified`

`boolean`

`expired`

`boolean`

`verification_status`

`string`

[# Relationships](#/apps/people/2025-03-20/vertices/custom_sender#relationships)

Name

Type

Association Type

Note

custom\_sender\_shares

CustomSenderShare

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/custom_sender#url-parameters)

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

order

verification\_requested\_at

string

prefix with a hyphen (-verification\_requested\_at) to reverse the order

order

verified\_at

string

prefix with a hyphen (-verified\_at) to reverse the order

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

[# Endpoints](#/apps/people/2025-03-20/vertices/custom_sender#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/custom_senders`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/custom_senders/{id}`

Copy

[# Actions](#/apps/people/2025-03-20/vertices/custom_sender#actions)

# send\_verification

HTTP Method

Endpoint

Description

POST

`/people/v2/custom_senders/{custom_sender_id}/send_verification`

Copy

Begins the verification process when a custom sender's email address is created or updated.

Permissions:

Must be authenticated