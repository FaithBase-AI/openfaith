Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_resource_request.md)

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

# EventResourceRequest

A room or resource request for a specific event.

[# Example Request](#/apps/calendar/2022-07-07/vertices/event_resource_request#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/event_resource_requests
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/event_resource_requests)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event_resource_request#example-object)

```
{
  "type": "EventResourceRequest",
  "id": "1",
  "attributes": {
    "approval_sent": true,
    "approval_status": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "notes": "string",
    "quantity": 1
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    },
    "resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    },
    "event_resource_request": {
      "data": {
        "type": "EventResourceRequest",
        "id": "1"
      }
    },
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
    "room_setup": {
      "data": {
        "type": "RoomSetup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event_resource_request#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the request

`approval_sent`

`boolean`

Whether or not an email has been sent to request approval

`approval_status`

`string`

Possible values:

* `A`: approved
* `P`: pending
* `R`: rejected

`created_at`

`date_time`

UTC time at which request was created

`updated_at`

`date_time`

UTC time at which request was updated

`notes`

`string`

Additional information about the room or resource request

`quantity`

`integer`

How many of the rooms or resources are being requested

[# Relationships](#/apps/calendar/2022-07-07/vertices/event_resource_request#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

resource

Resource

to\_one

event\_resource\_request

EventResourceRequest

to\_one

created\_by

Person

to\_one

updated\_by

Person

to\_one

room\_setup

RoomSetup

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event_resource_request#url-parameters)

# Can Include

Parameter

Value

Description

include

created\_by

include associated created\_by

include

event

include associated event

include

resource

include associated resource

include

room\_setup

include associated room\_setup

include

updated\_by

include associated updated\_by

# Query By

Name

Parameter

Type

Description

Example

approval\_sent

where[approval\_sent]

boolean

Query on a specific approval\_sent

`?where[approval_sent]=true`

approval\_status

where[approval\_status]

string

Query on a specific approval\_status

`?where[approval_status]=string`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event_resource_request#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/event_resource_requests`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/event_resource_requests/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/event_resource_request#associations)

# answers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/answers`

Copy

[EventResourceAnswer](event_resource_answer.md)

# created\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/created_by`

Copy

[Person](person.md)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/event`

Copy

[Event](event.md)

# resource\_bookings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/resource_bookings`

Copy

[ResourceBooking](resource_booking.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`

# resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/resource`

Copy

[Resource](resource.md)

# room\_setup

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/room_setup`

Copy

[RoomSetup](room_setup.md)

# updated\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/updated_by`

Copy

[Person](person.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event_resource_request#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_resource_requests`

Copy

[Event](event.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/people/{person_id}/event_resource_requests`

Copy

[Person](person.md)

* `awaiting_response`
* `future`
* `not_in_conflict`
* `not_overbooked`
* `overbooked`

# ResourceApprovalGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/event_resource_requests`

Copy

[ResourceApprovalGroup](resource_approval_group.md)

* `awaiting_response`
* `future`
* `not_in_conflict`
* `not_overbooked`
* `overbooked`

# ResourceBooking

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/event_resource_request`

Copy

[ResourceBooking](resource_booking.md)

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/event_resource_requests`

Copy

[Resource](resource.md)