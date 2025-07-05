Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](headcount.md)

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

# Headcount

A tally of attendees for a given event time and attendance type.
If one does not exist, the count may have been zero.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/headcount#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/headcounts
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/headcounts)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/headcount#example-object)

```
{
  "type": "Headcount",
  "id": "1",
  "attributes": {
    "total": 1,
    "updated_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "event_time": {
      "data": {
        "type": "EventTime",
        "id": "1"
      }
    },
    "attendance_type": {
      "data": {
        "type": "AttendanceType",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/headcount#attributes)

Name

Type

Description

`id`

`primary_key`

`total`

`integer`

`updated_at`

`date_time`

`created_at`

`date_time`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/headcount#relationships)

Name

Type

Association Type

Note

event\_time

EventTime

to\_one

attendance\_type

AttendanceType

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/headcount#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

attendance\_type

include associated attendance\_type

create and update

include

event\_time

include associated event\_time

create and update

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

total

string

prefix with a hyphen (-total) to reverse the order

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/headcount#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/headcounts`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/headcounts/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/headcount#associations)

# attendance\_type

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/headcounts/{headcount_id}/attendance_type`

Copy

[AttendanceType](attendance_type.md)

# event\_time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/headcounts/{headcount_id}/event_time`

Copy

[EventTime](event_time.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/headcount#belongs-to)

# AttendanceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/attendance_types/{attendance_type_id}/headcounts`

Copy

[AttendanceType](attendance_type.md)

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/headcounts`

Copy

[EventTime](event_time.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/headcounts`

Copy

[Organization](organization.md)