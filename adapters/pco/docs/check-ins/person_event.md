Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person_event.md)

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

# PersonEvent

Counts a person's attendence for a given event.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/person_event#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/events/{event_id}/person_events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/events/{event_id}/person_events)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/person_event#example-object)

```
{
  "type": "PersonEvent",
  "id": "1",
  "attributes": {
    "check_in_count": 1,
    "updated_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/person_event#attributes)

Name

Type

Description

`id`

`primary_key`

`check_in_count`

`integer`

`updated_at`

`date_time`

`created_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/person_event#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

include

first\_check\_in

include associated first\_check\_in

include

last\_check\_in

include associated last\_check\_in

include

person

include associated person

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/person_event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/events/{event_id}/person_events`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/events/{event_id}/person_events/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/person_event#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/event`

Copy

[Event](event.md)

# first\_check\_in

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/first_check_in`

Copy

[CheckIn](check_in.md)

# last\_check\_in

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/last_check_in`

Copy

[CheckIn](check_in.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/person_event#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events`

Copy

[Event](event.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/person_events`

Copy

[Person](person.md)