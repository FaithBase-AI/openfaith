Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](theme.md)

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

# Theme

A custom style which may be applied to stations.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/theme#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/themes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/themes)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/theme#example-object)

```
{
  "type": "Theme",
  "id": "1",
  "attributes": {
    "image_thumbnail": "string",
    "name": "string",
    "color": "string",
    "text_color": "string",
    "image": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "background_color": "string",
    "mode": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/theme#attributes)

Name

Type

Description

`id`

`primary_key`

`image_thumbnail`

`string`

`name`

`string`

`color`

`string`

`text_color`

`string`

`image`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`background_color`

`string`

`mode`

`string`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/theme#url-parameters)

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/theme#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/themes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/themes/{id}`

Copy

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/theme#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/themes`

Copy

[Organization](organization.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/theme`

Copy

[Station](station.md)