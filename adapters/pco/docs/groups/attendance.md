Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attendance.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)

2023-07-10

Info

[Attendance](attendance.md)

[Campus](campus.md)

[Enrollment](enrollment.md)

[Event](event.md)

[EventNote](event_note.md)

[Group](group.md)

[GroupApplication](group_application.md)

[GroupType](group_type.md)

[Location](location.md)

[Membership](membership.md)

[Organization](organization.md)

[Owner](owner.md)

[Person](person.md)

[Resource](resource.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Attendance

Collection Only

Individual event attendance for a person.

[# Example Request](#/apps/groups/2023-07-10/vertices/attendance#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/events/{event_id}/attendances
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/events/{event_id}/attendances)

[# Example Object](#/apps/groups/2023-07-10/vertices/attendance#example-object)

```
{
  "type": "Attendance",
  "id": "1",
  "attributes": {
    "attended": true,
    "role": "value"
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/attendance#attributes)

Name

Type

Description

`id`

`primary_key`

`attended`

`boolean`

Whether or not the person attended the event.

`role`

`string`

The role of the person at the time of event.

Possible values: `member`, `leader`, `visitor`, or `applicant`

[# Relationships](#/apps/groups/2023-07-10/vertices/attendance#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

event

Event

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/attendance#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

person

include associated person

create and update

# Order By

Parameter

Value

Type

Description

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

order

role

string

prefix with a hyphen (-role) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

role

where[role]

string

Query on a specific role

Possible values: `member`, `leader`, `visitor`, or `applicant`

`?where[role]=value`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/attendance#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/events/{event_id}/attendances`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/attendance#associations)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/attendances/{attendance_id}/person`

Copy

[Person](person.md)

person belonging to this attendance

[# Belongs To](#/apps/groups/2023-07-10/vertices/attendance#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/attendances`

Copy

[Event](event.md)

attendances recorded for this event

* `attended` — where `attended` is `true`