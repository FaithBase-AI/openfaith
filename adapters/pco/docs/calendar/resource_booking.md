Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource_booking.md)

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

# ResourceBooking

A specific booking of a room or resource for an event instance.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource_booking#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resource_bookings
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resource_bookings)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource_booking#example-object)

```
{
  "type": "ResourceBooking",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "starts_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "quantity": 1
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    },
    "event_instance": {
      "data": {
        "type": "EventInstance",
        "id": "1"
      }
    },
    "resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource_booking#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the booking

`created_at`

`date_time`

UTC time at which the booking was created

`ends_at`

`date_time`

UTC time at which usage of the booked room or resource ends

`starts_at`

`date_time`

UTC time at which usage of the booked room or resource starts

`updated_at`

`date_time`

UTC time at which the booking was updated

`quantity`

`integer`

The quantity of the rooms or resources booked

[# Relationships](#/apps/calendar/2022-07-07/vertices/resource_booking#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

event\_instance

EventInstance

to\_one

resource

Resource

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource_booking#url-parameters)

# Can Include

Parameter

Value

Description

include

event\_instance

include associated event\_instance

include

event\_resource\_request

include associated event\_resource\_request

include

resource

include associated resource

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

ends\_at

string

prefix with a hyphen (-ends\_at) to reverse the order

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

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

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

ends\_at

where[ends\_at]

date\_time

Query on a specific ends\_at

`?where[ends_at]=2000-01-01T12:00:00Z`

starts\_at

where[starts\_at]

date\_time

Query on a specific starts\_at

`?where[starts_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource_booking#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resource_bookings`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resource_bookings/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/resource_booking#associations)

# event\_instance

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/event_instance`

Copy

[EventInstance](event_instance.md)

# event\_resource\_request

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/event_resource_request`

Copy

[EventResourceRequest](event_resource_request.md)

# resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/resource`

Copy

[Resource](resource.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource_booking#belongs-to)

# EventInstance

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/resource_bookings`

Copy

[EventInstance](event_instance.md)

* `future`
* `resources`
* `rooms`

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/resource_bookings`

Copy

[Event](event.md)

* `future`

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/resource_bookings`

Copy

[EventResourceRequest](event_resource_request.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_bookings`

Copy

[Organization](organization.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`
* `resources`
* `rooms`

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_bookings`

Copy

[Resource](resource.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`