Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](field_datum.md)

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

# FieldDatum

A field datum is an individual piece of data for a custom field.

[# Example Request](#/apps/people/2025-03-20/vertices/field_datum#example-request)

```
curl https://api.planningcenteronline.com/people/v2/field_data
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/field_data)

[# Example Object](#/apps/people/2025-03-20/vertices/field_datum#example-object)

```
{
  "type": "FieldDatum",
  "id": "1",
  "attributes": {
    "value": "string",
    "file": "string",
    "file_size": 1,
    "file_content_type": "string",
    "file_name": "string"
  },
  "relationships": {
    "field_definition": {
      "data": {
        "type": "FieldDefinition",
        "id": "1"
      }
    },
    "customizable": {
      "data": {
        "type": "Customizable",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/field_datum#attributes)

Name

Type

Description

`id`

`primary_key`

`value`

`string`

`file`

`string`

`file_size`

`integer`

`file_content_type`

`string`

`file_name`

`string`

[# Relationships](#/apps/people/2025-03-20/vertices/field_datum#relationships)

Name

Type

Association Type

Note

field\_definition

FieldDefinition

to\_one

customizable

Customizable

to\_one

Currently, the only customizable relationship is with `Person`.

[# URL Parameters](#/apps/people/2025-03-20/vertices/field_datum#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

field\_definition

include associated field\_definition

create and update

include

field\_option

include associated field\_option

include

tab

include associated tab

# Order By

Parameter

Value

Type

Description

order

file

string

prefix with a hyphen (-file) to reverse the order

order

file\_content\_type

string

prefix with a hyphen (-file\_content\_type) to reverse the order

order

file\_name

string

prefix with a hyphen (-file\_name) to reverse the order

order

file\_size

string

prefix with a hyphen (-file\_size) to reverse the order

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

field\_definition\_id

where[field\_definition\_id]

integer

Query on a related field\_definition

`?where[field_definition_id]=1`

file

where[file]

string

Query on a specific file

`?where[file]=string`

file\_content\_type

where[file\_content\_type]

string

Query on a specific file\_content\_type

`?where[file_content_type]=string`

file\_name

where[file\_name]

string

Query on a specific file\_name

`?where[file_name]=string`

file\_size

where[file\_size]

integer

Query on a specific file\_size

`?where[file_size]=1`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/field_datum#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/field_data`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/field_data/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/field_data`

Copy

* value
* field\_definition\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/field_data/{id}`

Copy

* value
* field\_definition\_id

Notes:

Given a person ID and a field definition ID with a data type of 'checkboxes', in order to 'check' the box for that profile, you want to do a POST request to `/people/v2/people/<person_id>/field_data`.
The payload must contain the `field_definition_id` and the string `value`.

```


```
   {
     "data": {
        "attributes": {
          "field_definition_id": <field_definition_id>,
          "value": "Financial/Bills"
        }
     }
   }

```


```

Note that if you POST with a value that does not already correspond to an existing field\_option value for that field\_definition, then the API will create a new one with that value.

You can GET all the existing checkbox values at `/people/v2/field_definitions/<field_definition_id>/field_options`.

To 'uncheck' the value of the checkbox, you can issue a DELETE to `/people/v2/people/<person_id>/field_data/<field_datum_id>`.

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/field_data/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/field_datum#associations)

# field\_definition

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/field_definition`

Copy

[FieldDefinition](field_definition.md)

# field\_option

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/field_option`

Copy

[FieldOption](field_option.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/person`

Copy

[Person](person.md)

# tab

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/tab`

Copy

[Tab](tab.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/field_datum#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_data`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/field_data`

Copy

[Person](person.md)