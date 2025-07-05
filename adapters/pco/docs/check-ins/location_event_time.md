Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](location_event_time.md)

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

# LocationEventTime

Counts check-ins for a location for a given event time.
This is useful for checking occupancy.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/location_event_time#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/event_times/{event_time_id}/location_event_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/event_times/{event_time_id}/location_event_times)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/location_event_time#example-object)

```
{
  "type": "LocationEventTime",
  "id": "1",
  "attributes": {
    "regular_count": 1,
    "guest_count": 1,
    "volunteer_count": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/location_event_time#attributes)

Name

Type

Description

`id`

`primary_key`

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

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/location_event_time#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event\_time

include associated event\_time

include

location

include associated location

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/location_event_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/location_event_time#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/check_ins`

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

# event\_time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/event_time`

Copy

[EventTime](event_time.md)

# location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/location`

Copy

[Location](location.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/location_event_time#belongs-to)

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times`

Copy

[EventTime](event_time.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/location_event_times`

Copy

[Location](location.md)