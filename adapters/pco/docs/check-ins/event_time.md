Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_time.md)

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

# EventTime

A time that someone may check in. Times are copied from session to session.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/event_time#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/event_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/event_times)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/event_time#example-object)

```
{
  "type": "EventTime",
  "id": "1",
  "attributes": {
    "total_count": 1,
    "starts_at": "2000-01-01T12:00:00Z",
    "shows_at": "2000-01-01T12:00:00Z",
    "hides_at": "2000-01-01T12:00:00Z",
    "regular_count": 1,
    "guest_count": 1,
    "volunteer_count": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "hour": 1,
    "minute": 1,
    "day_of_week": 1
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    },
    "event_period": {
      "data": {
        "type": "EventPeriod",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/event_time#attributes)

Name

Type

Description

`id`

`primary_key`

`total_count`

`integer`

`starts_at`

`date_time`

`shows_at`

`date_time`

`hides_at`

`date_time`

`regular_count`

`integer`

`guest_count`

`integer`

`volunteer_count`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`name`

`string`

`hour`

`integer`

`minute`

`integer`

`day_of_week`

`integer`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/event_time#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

event\_period

EventPeriod

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/event_time#url-parameters)

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

event\_period

include associated event\_period

create and update

include

headcounts

include associated headcounts

# Order By

Parameter

Value

Type

Description

order

shows\_at

string

prefix with a hyphen (-shows\_at) to reverse the order

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/event_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/event_times`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/event_times/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/event_time#associations)

# available\_locations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/available_locations`

Copy

[Location](location.md)

* `for_current_station`

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/check_ins`

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

`/check-ins/v2/event_times/{event_time_id}/event`

Copy

[Event](event.md)

# event\_period

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/event_period`

Copy

[EventPeriod](event_period.md)

# headcounts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/headcounts`

Copy

[Headcount](headcount.md)

# location\_event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times`

Copy

[LocationEventTime](location_event_time.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/event_time#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_times`

Copy

[CheckIn](check_in.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/current_event_times`

Copy

[Event](event.md)

# EventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/event_times`

Copy

[EventPeriod](event_period.md)

* `available`

# Headcount

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/headcounts/{headcount_id}/event_time`

Copy

[Headcount](headcount.md)

# LocationEventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/event_time`

Copy

[LocationEventTime](location_event_time.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times`

Copy

[Organization](organization.md)