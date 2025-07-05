Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](tag.md)

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

# Tag

Tags are used to filter groups.
They can be organized into tag\_groups.

[# Example Request](#/apps/groups/2023-07-10/vertices/tag#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/tags
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/tags)

[# Example Object](#/apps/groups/2023-07-10/vertices/tag#example-object)

```
{
  "type": "Tag",
  "id": "1",
  "attributes": {
    "name": "string",
    "position": 1
  },
  "relationships": {
    "tag_group": {
      "data": {
        "type": "TagGroup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/tag#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

The name of the tag

`position`

`integer`

The position of the tag in relation to other tags

[# Relationships](#/apps/groups/2023-07-10/vertices/tag#relationships)

Name

Type

Association Type

Note

tag\_group

TagGroup

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/tag#url-parameters)

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

order

position

string

prefix with a hyphen (-position) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

name

where[name]

string

Query on a specific name

`?where[name]=string`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/tag#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/tags`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/tags/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/tag#associations)

# groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/tags/{tag_id}/groups`

Copy

[Group](group.md)

groups which have applied this tag

[# Belongs To](#/apps/groups/2023-07-10/vertices/tag#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/tags`

Copy

[Group](group.md)

tags assigned to this group

# TagGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/tag_groups/{tag_group_id}/tags`

Copy

[TagGroup](tag_group.md)

tags belonging to this tag group