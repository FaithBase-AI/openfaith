Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](check_in_group.md)

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

# CheckInGroup

When one or more people check in, they're grouped in a `CheckInGroup`.
These check-ins all have the same "checked-in by" person.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/check_in_group#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/check_in_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/check_in_groups)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/check_in_group#example-object)

```
{
  "type": "CheckInGroup",
  "id": "1",
  "attributes": {
    "name_labels_count": 1,
    "security_labels_count": 1,
    "check_ins_count": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "print_status": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/check_in_group#attributes)

Name

Type

Description

`id`

`primary_key`

`name_labels_count`

`integer`

`security_labels_count`

`integer`

`check_ins_count`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`print_status`

`string`

Possible values:

* `ready`: This group isn't printed or canceled yet
* `printed`: This group was successfully printed at a station
* `canceled`: This group was canceled at a station
* `skipped`: This group had no labels to print, so it was never printed.

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/check_in_group#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

check\_ins

include associated check\_ins

include

event\_period

include associated event\_period

include

print\_station

include associated print\_station

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/check_in_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/check_in_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/check_in_groups/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/check_in_group#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/check_ins`

Copy

[CheckIn](check_in.md)

# event\_period

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/event_period`

Copy

[EventPeriod](event_period.md)

# print\_station

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/print_station`

Copy

[Station](station.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/check_in_group#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_group`

Copy

[CheckIn](check_in.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/check_in_groups`

Copy

[Station](station.md)

* `canceled`
* `printed`
* `ready`
* `skipped`