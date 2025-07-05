Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](station.md)

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

# Station

A device where people can be checked in.
A device may also be connected to a printer
and print labels for itself or other stations.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/station#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/stations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/stations)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/station#example-object)

```
{
  "type": "Station",
  "id": "1",
  "attributes": {
    "online": true,
    "mode": 1,
    "name": "string",
    "timeout_seconds": 1,
    "input_type": "value",
    "input_type_options": "value",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "next_shows_at": "2000-01-01T12:00:00Z",
    "open_for_check_in": true,
    "closes_at": "2000-01-01T12:00:00Z",
    "check_in_count": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/station#attributes)

Name

Type

Description

`id`

`primary_key`

`online`

`boolean`

Only available when requested with the `?fields` param

`mode`

`integer`

`name`

`string`

`timeout_seconds`

`integer`

`input_type`

`string`

Possible values: `scanner` or `keypad`

`input_type_options`

`string`

Possible values: `all_input_types`, `only_keypad`, or `only_scanner`

`created_at`

`date_time`

`updated_at`

`date_time`

`next_shows_at`

`date_time`

Only available when requested with the `?fields` param

`open_for_check_in`

`boolean`

Only available when requested with the `?fields` param

`closes_at`

`date_time`

Only available when requested with the `?fields` param

`check_in_count`

`integer`

Only available when requested with the `?fields` param

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/station#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

include

location

include associated location

include

print\_station

include associated print\_station

include

theme

include associated theme

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/station#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/stations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/stations/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/station#associations)

# check\_in\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/check_in_groups`

Copy

[CheckInGroup](check_in_group.md)

* `canceled`
* `printed`
* `ready`
* `skipped`

# checked\_in\_at\_check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/checked_in_at_check_ins`

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

`/check-ins/v2/stations/{station_id}/event`

Copy

[Event](event.md)

# location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/location`

Copy

[Location](location.md)

# print\_station

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/print_station`

Copy

[Station](station.md)

# theme

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/theme`

Copy

[Theme](theme.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/station#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_in_at`

Copy

[CheckIn](check_in.md)

# CheckInGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/print_station`

Copy

[CheckInGroup](check_in_group.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations`

Copy

[Organization](organization.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/print_station`

Copy

[Station](station.md)