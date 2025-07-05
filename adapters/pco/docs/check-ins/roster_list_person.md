Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](roster_list_person.md)

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

# RosterListPerson

[# Example Request](#/apps/check-ins/2025-05-28/vertices/roster_list_person#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/roster_list_person#example-object)

```
{
  "type": "RosterListPerson",
  "id": "1",
  "attributes": {
    "first_name": "string",
    "last_name": "string",
    "name": "string",
    "demographic_avatar_url": "string",
    "grade": "string",
    "gender": "string",
    "medical_notes": "string",
    "birthdate": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/roster_list_person#attributes)

Name

Type

Description

`id`

`primary_key`

`first_name`

`string`

`last_name`

`string`

`name`

`string`

`demographic_avatar_url`

`string`

`grade`

`string`

`gender`

`string`

`medical_notes`

`string`

`birthdate`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/roster_list_person#url-parameters)

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/roster_list_person#endpoints)

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