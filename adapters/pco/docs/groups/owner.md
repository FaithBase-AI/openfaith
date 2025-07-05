Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](owner.md)

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

# Owner

The owner/creator of an event note.

[# Example Request](#/apps/groups/2023-07-10/vertices/owner#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/events/{event_id}/notes/{note_id}/owner
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/events/{event_id}/notes/{note_id}/owner)

[# Example Object](#/apps/groups/2023-07-10/vertices/owner#example-object)

```
{
  "type": "Owner",
  "id": "1",
  "attributes": {
    "avatar_url": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/owner#attributes)

Name

Type

Description

`id`

`primary_key`

`avatar_url`

`string`

The URL of the person's avatar.

`first_name`

`string`

The person's first name.

`last_name`

`string`

The person's last name.

[# URL Parameters](#/apps/groups/2023-07-10/vertices/owner#url-parameters)

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/owner#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/events/{event_id}/notes/{note_id}/owner`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/events/{event_id}/notes/{note_id}/owner/{id}`

Copy

[# Belongs To](#/apps/groups/2023-07-10/vertices/owner#belongs-to)

# EventNote

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/notes/{event_note_id}/owner`

Copy

[EventNote](event_note.md)

person who created the note