Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event.md)

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

# Event

A recurring event which people may attend.

Each recurrence is an

event period

(which often corresponds to a week).

Event periods have

event times

where people may actually check in.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/event#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/events)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/event#example-object)

```
{
  "type": "Event",
  "id": "1",
  "attributes": {
    "name": "string",
    "frequency": "string",
    "enable_services_integration": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "archived_at": "2000-01-01T12:00:00Z",
    "integration_key": "string",
    "location_times_enabled": true,
    "pre_select_enabled": true,
    "app_source": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/event#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`frequency`

`string`

`enable_services_integration`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`archived_at`

`date_time`

`integration_key`

`string`

`location_times_enabled`

`boolean`

`pre_select_enabled`

`boolean`

`app_source`

`string`

Only available when requested with the `?fields` param

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/event#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

attendance\_types

include associated attendance\_types

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

name

string

prefix with a hyphen (-name) to reverse the order

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/events`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/events/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/event#associations)

# attendance\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/attendance_types`

Copy

[AttendanceType](attendance_type.md)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/check_ins`

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

# current\_event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/current_event_times`

Copy

[EventTime](event_time.md)

# event\_labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels`

Copy

[EventLabel](event_label.md)

# event\_periods

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_periods`

Copy

[EventPeriod](event_period.md)

# integration\_links

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/integration_links`

Copy

[IntegrationLink](integration_link.md)

# locations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/locations`

Copy

[Location](location.md)

* `locations`
* `root`

# person\_events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events`

Copy

[PersonEvent](person_event.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/event#belongs-to)

# AttendanceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/attendance_types/{attendance_type_id}/event`

Copy

[AttendanceType](attendance_type.md)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event`

Copy

[CheckIn](check_in.md)

# EventLabel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels/{event_label_id}/event`

Copy

[EventLabel](event_label.md)

# EventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/event`

Copy

[EventPeriod](event_period.md)

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/event`

Copy

[EventTime](event_time.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/event`

Copy

[Location](location.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events`

Copy

[Organization](organization.md)

* `archived`
* `for_headcounts`
* `for_registrations`
* `not_archived`

# PersonEvent

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/event`

Copy

[PersonEvent](person_event.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/event`

Copy

[Station](station.md)