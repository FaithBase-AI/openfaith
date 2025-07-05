Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_period.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)

2025-05-28

Info

[AttendanceType](attendance_type.md)

[CheckIn](check_in.md)

[CheckInGroup](check_in_group.md)

[CheckInTime](check_in_time.md)

[Event](event.md)

[EventLabel](event_label.md)

[EventPeriod](event_period.md)

[EventTime](event_time.md)

[Headcount](headcount.md)

[IntegrationLink](integration_link.md)

[Label](label.md)

[Location](location.md)

[LocationEventPeriod](location_event_period.md)

[LocationEventTime](location_event_time.md)

[LocationLabel](location_label.md)

[Option](option.md)

[Organization](organization.md)

[Pass](pass.md)

[Person](person.md)

[PersonEvent](person_event.md)

[PreCheck](pre_check.md)

[RosterListPerson](roster_list_person.md)

[Station](station.md)

[Theme](theme.md)

[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# EventPeriod

A recurrence of an event, sometimes called a "session".
For weekly events, an event period is a week. For daily events, an event period is a day.
An event period has event times, which is what people select
when they actually check in. When new sessions are created, times
are copied from one session to the next.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/event_period#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/check_ins/{check_in_id}/event_period
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/check_ins/{check_in_id}/event_period)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/event_period#example-object)

```
{
  "type": "EventPeriod",
  "id": "1",
  "attributes": {
    "starts_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "regular_count": 1,
    "guest_count": 1,
    "volunteer_count": 1,
    "note": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
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

[# Attributes](#/apps/check-ins/2025-05-28/vertices/event_period#attributes)

Name

Type

Description

`id`

`primary_key`

`starts_at`

`date_time`

`ends_at`

`date_time`

`regular_count`

`integer`

`guest_count`

`integer`

`volunteer_count`

`integer`

`note`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/event_period#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/event_period#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

create and update

include

event\_times

include associated event\_times

# Order By

Parameter

Value

Type

Description

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/event_period#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/event_period#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/check_ins`

Copy

[CheckIn](check_in.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/event`

Copy

[Event](event.md)

# event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/event_times`

Copy

[EventTime](event_time.md)

* `available`

# location\_event\_periods

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods`

Copy

[LocationEventPeriod](location_event_period.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/event_period#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period`

Copy

[CheckIn](check_in.md)

# CheckInGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/event_period`

Copy

[CheckInGroup](check_in_group.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_periods`

Copy

[Event](event.md)

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/event_period`

Copy

[EventTime](event_time.md)

# LocationEventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/event_period`

Copy

[LocationEventPeriod](location_event_period.md)