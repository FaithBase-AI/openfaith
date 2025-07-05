Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event.md)

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

# Event

An event.

May contain information such as who owns
the event, visibility on Church Center and a public-facing summary.

[# Example Request](#/apps/calendar/2022-07-07/vertices/event#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/events)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event#example-object)

```
{
  "type": "Event",
  "id": "1",
  "attributes": {
    "approval_status": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "featured": true,
    "image_url": "string",
    "name": "string",
    "percent_approved": 1,
    "percent_rejected": 1,
    "registration_url": "string",
    "summary": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "visible_in_church_center": true
  },
  "relationships": {
    "owner": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the event

`approval_status`

`string`

Possible values:

* `A`: approved.
* `P`: pending.
* `R`: rejected.

`created_at`

`date_time`

UTC time at which the event was created

`description`

`string`

A rich text public-facing summary of the event

`featured`

`boolean`

* `true` indicates the event is featured on Church Center
* `false` indicates the event is not featured on Church Center

`image_url`

`string`

Path to where the event image is stored

`name`

`string`

The name of the event

`percent_approved`

`integer`

Calculated by taking the sum of the `percent_approved` for all
future `ReservationBlocks` and dividing that by the `count` of all future
`ReservationBlocks`.

If there are no future `ReservationBlocks`, returns `100`

`percent_rejected`

`integer`

Calculated by taking the sum of the `percent_rejected` for all
future `ReservationBlocks` and dividing that by the `count` of all future
`ReservationBlocks`.

If there are no future `ReservationBlocks`, returns `0`

`registration_url`

`string`

The registration URL for the event

`summary`

`string`

A plain text public-facing summary of the event

`updated_at`

`date_time`

UTC time at which the event was updated

`visible_in_church_center`

`boolean`

* `true` indicates the event Church Center visibility is set to 'Published'
* `false` indicates the event Church Center visibility is set to 'Hidden'

[# Relationships](#/apps/calendar/2022-07-07/vertices/event#relationships)

Name

Type

Association Type

Note

owner

Person

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event#url-parameters)

# Can Include

Parameter

Value

Description

include

attachments

include associated attachments

include

feed

include associated feed

include

owner

include associated owner

include

tags

include associated tags

# Query By

Name

Parameter

Type

Description

Example

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

featured

where[featured]

boolean

Query on a specific featured

`?where[featured]=true`

name

where[name]

string

Query on a specific name

`?where[name]=string`

percent\_approved

where[percent\_approved]

integer

Query on a specific percent\_approved

`?where[percent_approved]=1`

percent\_rejected

where[percent\_rejected]

integer

Query on a specific percent\_rejected

`?where[percent_rejected]=1`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

visible\_in\_church\_center

where[visible\_in\_church\_center]

boolean

Query on a specific visible\_in\_church\_center

`?where[visible_in_church_center]=true`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/events`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/events/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/event#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/attachments`

Copy

[Attachment](attachment.md)

# conflicts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/conflicts`

Copy

[Conflict](conflict.md)

# event\_connections

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_connections`

Copy

[EventConnection](event_connection.md)

# event\_instances

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_instances`

Copy

[EventInstance](event_instance.md)

* `future`

# event\_resource\_requests

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_resource_requests`

Copy

[EventResourceRequest](event_resource_request.md)

# feed

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/feed`

Copy

[Feed](feed.md)

# owner

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/owner`

Copy

[Person](person.md)

# resource\_bookings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/resource_bookings`

Copy

[ResourceBooking](resource_booking.md)

* `future`

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events/{event_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event#belongs-to)

# Attachment

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/attachments/{attachment_id}/event`

Copy

[Attachment](attachment.md)

# Conflict

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/winner`

Copy

[Conflict](conflict.md)

# EventInstance

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event`

Copy

[EventInstance](event_instance.md)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/event`

Copy

[EventResourceRequest](event_resource_request.md)

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event_times/{event_time_id}/event`

Copy

[EventTime](event_time.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events`

Copy

[Organization](organization.md)

* `future`

# Tag

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/events`

Copy

[Tag](tag.md)

# TagGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tag_groups/{tag_group_id}/events`

Copy

[TagGroup](tag_group.md)