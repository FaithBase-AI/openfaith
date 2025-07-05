Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attendance_type.md)

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

# AttendanceType

A kind of attendee which is tracked by

headcount

, not by check-in.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/attendance_type#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/attendance_types
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/attendance_types)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/attendance_type#example-object)

```
{
  "type": "AttendanceType",
  "id": "1",
  "attributes": {
    "name": "string",
    "color": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "limit": 1
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

[# Attributes](#/apps/check-ins/2025-05-28/vertices/attendance_type#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`color`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`limit`

`integer`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/attendance_type#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/attendance_type#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

create and update

# Query By

Name

Parameter

Type

Description

Example

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

name

where[name]

string

Query on a specific name

`?where[name]=string`

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/attendance_type#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/attendance_types`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/attendance_types/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/attendance_type#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/attendance_types/{attendance_type_id}/event`

Copy

[Event](event.md)

# headcounts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/attendance_types/{attendance_type_id}/headcounts`

Copy

[Headcount](headcount.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/attendance_type#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/attendance_types`

Copy

[Event](event.md)

# Headcount

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/headcounts/{headcount_id}/attendance_type`

Copy

[Headcount](headcount.md)