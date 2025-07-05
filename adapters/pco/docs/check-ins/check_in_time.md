Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](check_in_time.md)

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

# CheckInTime

A CheckInTime combines an EventTime and a Location, and associates it with
the parent CheckIn.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/check_in_time#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/check_ins/{check_in_id}/check_in_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/check_ins/{check_in_id}/check_in_times)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/check_in_time#example-object)

```
{
  "type": "CheckInTime",
  "id": "1",
  "attributes": {
    "kind": "string",
    "has_validated": true,
    "services_integrated": true,
    "alerts": []
  },
  "relationships": {
    "event_time": {
      "data": {
        "type": "EventTime",
        "id": "1"
      }
    },
    "location": {
      "data": {
        "type": "Location",
        "id": "1"
      }
    },
    "check_in": {
      "data": {
        "type": "CheckIn",
        "id": "1"
      }
    },
    "pre_check": {
      "data": {
        "type": "PreCheck",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/check_in_time#attributes)

Name

Type

Description

`id`

`primary_key`

`kind`

`string`

`has_validated`

`boolean`

`services_integrated`

`boolean`

`alerts`

`array`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/check_in_time#relationships)

Name

Type

Association Type

Note

event\_time

EventTime

to\_one

location

Location

to\_one

check\_in

CheckIn

to\_one

pre\_check

PreCheck

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/check_in_time#url-parameters)

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/check_in_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_times`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_times/{id}`

Copy

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/check_in_time#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_times`

Copy

[CheckIn](check_in.md)