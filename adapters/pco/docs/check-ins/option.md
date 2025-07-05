Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](option.md)

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

# Option

An option which an attendee may select when checking in.

Options may have extra labels associated with them, denoted by `label` and `quantity`.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/option#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/options
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/options)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/option#example-object)

```
{
  "type": "Option",
  "id": "1",
  "attributes": {
    "body": "string",
    "quantity": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/option#attributes)

Name

Type

Description

`id`

`primary_key`

`body`

`string`

`quantity`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/option#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/option#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/options`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/options/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/option#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/options/{option_id}/check_ins`

Copy

[CheckIn](check_in.md)

# label

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/options/{option_id}/label`

Copy

[Label](label.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/option#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/options`

Copy

[CheckIn](check_in.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/options`

Copy

[Location](location.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/options`

Copy

[Organization](organization.md)