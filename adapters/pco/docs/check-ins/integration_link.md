Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](integration_link.md)

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

# IntegrationLink

A record linking another product's resource to a Check-Ins resource.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/integration_link#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/integration_links
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/integration_links)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/integration_link#example-object)

```
{
  "type": "IntegrationLink",
  "id": "1",
  "attributes": {
    "remote_gid": "string",
    "remote_app": "string",
    "remote_type": "string",
    "remote_id": "string",
    "sync_future_assignment_types": true
  },
  "relationships": {
    "local": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/integration_link#attributes)

Name

Type

Description

`id`

`primary_key`

`remote_gid`

`string`

The Global ID for the external resource. Formatted as `gid://<app>/<type>/<id>`.

`remote_app`

`string`

`remote_type`

`string`

`remote_id`

`string`

`sync_future_assignment_types`

`boolean`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/integration_link#relationships)

Name

Type

Association Type

Note

local

(polymorphic)

to\_one

Type will be the type of Check-Ins resource it is linked to.

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/integration_link#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

remote\_gid

where[remote\_gid]

string

Query on a specific remote\_gid

`?where[remote_gid]=string`

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/integration_link#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/integration_links`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/integration_links/{id}`

Copy

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/integration_link#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/integration_links`

Copy

[Event](event.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/integration_links`

Copy

[Location](location.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/integration_links`

Copy

[Organization](organization.md)