Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](social_profile.md)

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

# SocialProfile

A social profile represents a members's Twitter, Facebook, or other social media account.

[# Example Request](#/apps/people/2025-03-20/vertices/social_profile#example-request)

```
curl https://api.planningcenteronline.com/people/v2/social_profiles
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/social_profiles)

[# Example Object](#/apps/people/2025-03-20/vertices/social_profile#example-object)

```
{
  "type": "SocialProfile",
  "id": "1",
  "attributes": {
    "site": "string",
    "url": "string",
    "verified": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/social_profile#attributes)

Name

Type

Description

`id`

`primary_key`

`site`

`string`

`url`

`string`

`verified`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/people/2025-03-20/vertices/social_profile#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

person

include associated person

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

site

string

prefix with a hyphen (-site) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

order

url

string

prefix with a hyphen (-url) to reverse the order

order

verified

string

prefix with a hyphen (-verified) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

site

where[site]

string

Query on a specific site

`?where[site]=string`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

url

where[url]

string

Query on a specific url

`?where[url]=string`

verified

where[verified]

boolean

Query on a specific verified

`?where[verified]=true`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/social_profile#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/social_profiles`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/social_profiles/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/social_profiles`

Copy

* site
* url
* verified

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/social_profiles/{id}`

Copy

* site
* url
* verified

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/social_profiles/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/social_profile#associations)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/social_profiles/{social_profile_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/social_profile#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/social_profiles`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/social_profiles`

Copy

[Person](person.md)