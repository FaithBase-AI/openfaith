Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_label.md)

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

# EventLabel

Says how many of a given label to print for this event and
whether to print it for regulars, guests, and/or volunteers.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/event_label#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/events/{event_id}/event_labels
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/events/{event_id}/event_labels)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/event_label#example-object)

```
{
  "type": "EventLabel",
  "id": "1",
  "attributes": {
    "quantity": 1,
    "for_regular": true,
    "for_guest": true,
    "for_volunteer": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/event_label#attributes)

Name

Type

Description

`id`

`primary_key`

`quantity`

`integer`

`for_regular`

`boolean`

`for_guest`

`boolean`

`for_volunteer`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/event_label#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

include

label

include associated label

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/event_label#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/events/{event_id}/event_labels`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/events/{event_id}/event_labels/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/event_label#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels/{event_label_id}/event`

Copy

[Event](event.md)

# label

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels/{event_label_id}/label`

Copy

[Label](label.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/event_label#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels`

Copy

[Event](event.md)

# Label

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/labels/{label_id}/event_labels`

Copy

[Label](label.md)