Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource_question.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)

2022-07-07

Info

[Attachment](attachment.md)

[Conflict](conflict.md)

[Event](event.md)

[EventConnection](event_connection.md)

[EventInstance](event_instance.md)

[EventResourceAnswer](event_resource_answer.md)

[EventResourceRequest](event_resource_request.md)

[EventTime](event_time.md)

[Feed](feed.md)

[JobStatus](job_status.md)

[Organization](organization.md)

[Person](person.md)

[ReportTemplate](report_template.md)

[RequiredApproval](required_approval.md)

[Resource](resource.md)

[ResourceApprovalGroup](resource_approval_group.md)

[ResourceBooking](resource_booking.md)

[ResourceFolder](resource_folder.md)

[ResourceQuestion](resource_question.md)

[ResourceSuggestion](resource_suggestion.md)

[RoomSetup](room_setup.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# ResourceQuestion

A question to answer when requesting to book a room or resource.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource_question#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resource_questions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resource_questions)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource_question#example-object)

```
{
  "type": "ResourceQuestion",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "kind": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "choices": "string",
    "description": "string",
    "multiple_select": true,
    "optional": true,
    "position": 1,
    "question": "string"
  },
  "relationships": {
    "resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource_question#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the question

`created_at`

`date_time`

UTC time at which the question was created

`kind`

`string`

Possible values:

* `dropdown`: predefined list of choices as an answer
* `paragraph`: expected answer is a paragraph
* `text`: expected answer is a sentence
* `yesno`: expected answer is 'Yes' or 'No'
* `section_header`: used to separate questions in the UI, no expected answer

`updated_at`

`date_time`

UTC time at which the question was updated

`choices`

`string`

If `kind` is `dropdown`, represents a string of dropdown choices
separated by the `|` character

`description`

`string`

Optional description of the question

`multiple_select`

`boolean`

If `kind` is `dropdown`,
`true` indicates that more than one selection is permitted

`optional`

`boolean`

* `true` indicates answering the question is not required when booking
* `false` indicates answering the question is required when booking

`position`

`integer`

Position of question in list in the UI

`question`

`string`

The question to be answered

[# Relationships](#/apps/calendar/2022-07-07/vertices/resource_question#relationships)

Name

Type

Association Type

Note

resource

Resource

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource_question#url-parameters)

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

kind

where[kind]

string

Query on a specific kind

`?where[kind]=string`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource_question#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resource_questions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resource_questions/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/resources/{resource_id}/resource_questions`

Copy

* choices
* description
* kind
* multiple\_select
* optional
* position
* question

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/resource_questions/{id}`

Copy

* choices
* description
* kind
* multiple\_select
* optional
* position
* question

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/resource_questions/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource_question#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_questions`

Copy

[Organization](organization.md)

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_questions`

Copy

[Resource](resource.md)