Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](location_event_period.md)

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

# LocationEventPeriod

Counts check-ins for a location during a certain event period.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/location_event_period#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/location_event_period#example-object)

```
{
  "type": "LocationEventPeriod",
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

[# Attributes](#/apps/check-ins/2025-05-28/vertices/location_event_period#attributes)

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

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/location_event_period#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event\_period

include associated event\_period

include

location

include associated location

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/location_event_period#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/location_event_period#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/check_ins`

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

# event\_period

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/event_period`

Copy

[EventPeriod](event_period.md)

# location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/location`

Copy

[Location](location.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/location_event_period#belongs-to)

# EventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods`

Copy

[EventPeriod](event_period.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/location_event_periods`

Copy

[Location](location.md)