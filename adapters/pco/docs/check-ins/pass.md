Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](pass.md)

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

# Pass

Enables quick lookup of a person via barcode reader.

[# Example Request](#/apps/check-ins/2025-05-28/vertices/pass#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/passes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/passes)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/pass#example-object)

```
{
  "type": "Pass",
  "id": "1",
  "attributes": {
    "code": "string",
    "kind": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/pass#attributes)

Name

Type

Description

`id`

`primary_key`

`code`

`string`

`kind`

`string`

Possible values: `barcode` or `pkpass`.

Using the `pkpass` value creates a mobile pass and sends an email to the associated person.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/pass#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

person

include associated person

# Query By

Name

Parameter

Type

Description

Example

code

where[code]

string

Query on a specific code

`?where[code]=string`

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/pass#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/passes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/passes/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/pass#associations)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/passes/{pass_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/pass#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/passes`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/passes`

Copy

[Person](person.md)