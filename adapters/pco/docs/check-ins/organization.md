Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

An organization which has people and events.
This contains its date format & time zone preferences.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "date_format_pattern": "string",
    "time_zone": "string",
    "name": "string",
    "daily_check_ins": 1,
    "avatar_url": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`date_format_pattern`

`string`

`time_zone`

`string`

`name`

`string`

`daily_check_ins`

`integer`

`avatar_url`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/organization#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins`

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

# event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/event_times`

Copy

[EventTime](event_time.md)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events`

Copy

[Event](event.md)

* `archived`
* `for_headcounts`
* `for_registrations`
* `not_archived`

# headcounts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/headcounts`

Copy

[Headcount](headcount.md)

# integration\_links

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/integration_links`

Copy

[IntegrationLink](integration_link.md)

# labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/labels`

Copy

[Label](label.md)

# options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/options`

Copy

[Option](option.md)

# passes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/passes`

Copy

[Pass](pass.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/people`

Copy

[Person](person.md)

# stations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/stations`

Copy

[Station](station.md)

# themes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/themes`

Copy

[Theme](theme.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/organization#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/organization`

Copy

[Person](person.md)