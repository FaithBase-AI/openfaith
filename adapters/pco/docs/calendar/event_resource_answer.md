Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_resource_answer.md)

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

# EventResourceAnswer

An answer to a question in a room or resource request.

[# Example Request](#/apps/calendar/2022-07-07/vertices/event_resource_answer#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/event_resource_requests/{event_resource_request_id}/answers
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/event_resource_requests/{event_resource_request_id}/answers)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event_resource_answer#example-object)

```
{
  "type": "EventResourceAnswer",
  "id": "1",
  "attributes": {
    "answer": {},
    "db_answer": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "question": {}
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "updated_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "resource_question": {
      "data": {
        "type": "ResourceQuestion",
        "id": "1"
      }
    },
    "event_resource_request": {
      "data": {
        "type": "EventResourceRequest",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event_resource_answer#attributes)

Name

Type

Description

`id`

`primary_key`

`answer`

`json`

The answer formatted for display

`db_answer`

`string`

Only available when requested with the `?fields` param

`created_at`

`date_time`

`updated_at`

`date_time`

`question`

`json`

Question details as of when it was answered

[# Relationships](#/apps/calendar/2022-07-07/vertices/event_resource_answer#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

updated\_by

Person

to\_one

resource\_question

ResourceQuestion

to\_one

event\_resource\_request

EventResourceRequest

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event_resource_answer#url-parameters)

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event_resource_answer#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/answers`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/answers/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event_resource_answer#belongs-to)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/answers`

Copy

[EventResourceRequest](event_resource_request.md)