Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_note.md)

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

# EventNote

Notes that group leaders can write for an event, generally related to attendance.

[# Example Request](#/apps/groups/2023-07-10/vertices/event_note#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/events/{event_id}/notes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/events/{event_id}/notes)

[# Example Object](#/apps/groups/2023-07-10/vertices/event_note#example-object)

```
{
  "type": "EventNote",
  "id": "1",
  "attributes": {
    "body": "string"
  },
  "relationships": {
    "annotatable": {
      "data": {
        "type": "Annotatable",
        "id": "1"
      }
    },
    "owner": {
      "data": {
        "type": "Owner",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/event_note#attributes)

Name

Type

Description

`id`

`primary_key`

`body`

`string`

The body text of the note.

[# Relationships](#/apps/groups/2023-07-10/vertices/event_note#relationships)

Name

Type

Association Type

Note

annotatable

Annotatable

to\_one

owner

Owner

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/event_note#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

owner

include associated owner

create and update

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/event_note#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/events/{event_id}/notes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/events/{event_id}/notes/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/event_note#associations)

# owner

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/notes/{event_note_id}/owner`

Copy

[Owner](owner.md)

person who created the note

[# Belongs To](#/apps/groups/2023-07-10/vertices/event_note#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/notes`

Copy

[Event](event.md)

notes added to the event