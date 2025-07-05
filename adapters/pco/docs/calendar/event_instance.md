Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_instance.md)

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

# EventInstance

A specific occurrence of an event.

If the event is recurring, `recurrence` will be set and
`recurrence_description` will provide an overview of the recurrence pattern.

[# Example Request](#/apps/calendar/2022-07-07/vertices/event_instance#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/event_instances
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/event_instances)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event_instance#example-object)

```
{
  "type": "EventInstance",
  "id": "1",
  "attributes": {
    "all_day_event": true,
    "compact_recurrence_description": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "location": "string",
    "recurrence": "string",
    "recurrence_description": "string",
    "starts_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "church_center_url": "string",
    "published_starts_at": "string",
    "published_ends_at": "string"
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event_instance#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the event instance

`all_day_event`

`boolean`

Indicates whether event instance lasts all day

`compact_recurrence_description`

`string`

Compact representation of event instance's recurrence pattern

`created_at`

`date_time`

UTC time at which the event instance was created

`ends_at`

`date_time`

UTC time at which the event instance ends

`location`

`string`

Representation of where the event instance takes place

`recurrence`

`string`

For a recurring event instance, the interval of how often the event instance occurs

`recurrence_description`

`string`

Longer description of the event instance's recurrence pattern

`starts_at`

`date_time`

UTC time at which the event instance starts

`updated_at`

`date_time`

UTC time at which the event instance was updated

`church_center_url`

`string`

The URL for the event on Church Center

`published_starts_at`

`string`

Publicly visible start time

`published_ends_at`

`string`

Publicly visible end time

[# Relationships](#/apps/calendar/2022-07-07/vertices/event_instance#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event_instance#url-parameters)

# Can Include

Parameter

Value

Description

include

event

include associated event

include

event\_times

include associated event\_times

include

resource\_bookings

include associated resource\_bookings

include

tags

include associated tags

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event_instance#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/event_instances`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/event_instances/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/event_instance#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event`

Copy

[Event](event.md)

# event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event_times`

Copy

[EventTime](event_time.md)

# resource\_bookings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/resource_bookings`

Copy

[ResourceBooking](resource_booking.md)

* `future`
* `resources`
* `rooms`

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event_instance#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_instances`

Copy

[Event](event.md)

* `future`

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances`

Copy

[Organization](organization.md)

* `all` — filter to instances you approve, manage, own, or subscribe to; can't be combined with any other user scopes
* `approved` — filter to instances that are approved; can't be combined with any other `approved` scopes
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `approver` — filter to instances you approve; can't be combined with any other `approver` scopes
* `approver_subscriber`
* `future`
* `lost`
* `manager` — filter to instances you manage; can't be combined with any other `manager` scopes
* `manager_approver`
* `manager_approver_subscriber`
* `manager_subscriber`
* `owner` — filter to instances you own; can't be combined with any other `owner` scopes
* `owner_approver`
* `owner_approver_subscriber`
* `owner_manager`
* `owner_manager_approver`
* `owner_manager_approver_subscriber`
* `owner_manager_subscriber`
* `owner_subscriber`
* `pending` — filter to instances that are pending; can't be combined with any other `pending` scopes
* `pending_rejected`
* `rejected` — filter to instances that are rejected; can't be combined with any other `rejected` scopes
* `shared`
* `subscriber` — filter to instances you subscribe to; can't be combined with any other `subscriber` scopes
* `unresolved`

# ResourceBooking

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/event_instance`

Copy

[ResourceBooking](resource_booking.md)

# Tag

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/event_instances`

Copy

[Tag](tag.md)