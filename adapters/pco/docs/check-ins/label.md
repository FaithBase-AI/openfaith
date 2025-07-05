Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](label.md)

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

# Label

Labels can be set to print for events (through `EventLabel`s),
locations (through `LocationLabel`s) or options.
Label type (security label / name label) is expressed with the
`prints_for` attribute. `prints_for="Person"` is a name label,
`prints_for="Group"` is a security label.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/label#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/labels
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/labels)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/label#example-object)

```
{
  "type": "Label",
  "id": "1",
  "attributes": {
    "name": "string",
    "xml": "string",
    "prints_for": "string",
    "roll": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/label#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`xml`

`string`

`prints_for`

`string`

`roll`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/label#url-parameters)

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/label#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/labels`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/labels/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/label#associations)

# event\_labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/labels/{label_id}/event_labels`

Copy

[EventLabel](event_label.md)

# location\_labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/labels/{label_id}/location_labels`

Copy

[LocationLabel](location_label.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/label#belongs-to)

# EventLabel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/event_labels/{event_label_id}/label`

Copy

[EventLabel](event_label.md)

# LocationLabel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/labels/{label_id}/location_labels/{location_label_id}/label`

Copy

[LocationLabel](location_label.md)

# Option

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/options/{option_id}/label`

Copy

[Option](option.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/labels`

Copy

[Organization](organization.md)