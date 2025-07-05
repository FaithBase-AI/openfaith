Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource.md)

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

# Resource

A file or link resource that can be shared with a group.

[# Example Request](#/apps/groups/2023-07-10/vertices/resource#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/group_types/{group_type_id}/resources
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/group_types/{group_type_id}/resources)

[# Example Object](#/apps/groups/2023-07-10/vertices/resource#example-object)

```
{
  "type": "Resource",
  "id": "1",
  "attributes": {
    "description": "string",
    "last_updated": "2000-01-01T12:00:00Z",
    "name": "string",
    "type": "string",
    "visibility": "value"
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/resource#attributes)

Name

Type

Description

`id`

`primary_key`

`description`

`string`

The description of the resource written by the person who created it.

`last_updated`

`date_time`

The date and time the resource was last updated.

`name`

`string`

The name/title of the resource.

`type`

`string`

Either `FileResource` or `LinkResource`

`visibility`

`string`

Possible values: `leaders` or `members`

[# Relationships](#/apps/groups/2023-07-10/vertices/resource#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

The person who created this resource

[# URL Parameters](#/apps/groups/2023-07-10/vertices/resource#url-parameters)

# Order By

Parameter

Value

Type

Description

order

last\_updated

string

prefix with a hyphen (-last\_updated) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/resource#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/group_types/{group_type_id}/resources`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/group_types/{group_type_id}/resources/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/resource#associations)

# download

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources/{resource_id}/download`

Copy

[Resource](resource.md)

link to download this file resource

# visit

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources/{resource_id}/visit`

Copy

[Resource](resource.md)

link to visit this link resource

[# Belongs To](#/apps/groups/2023-07-10/vertices/resource#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/resources`

Copy

[Group](group.md)

file and link resources shared with this group

* `leaders` — only visible to group leaders

# GroupType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources`

Copy

[GroupType](group_type.md)

file or link resources shared with all groups in this group type

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources/{resource_id}/download`

Copy

[Resource](resource.md)

link to download this file resource

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources/{resource_id}/visit`

Copy

[Resource](resource.md)

link to visit this link resource