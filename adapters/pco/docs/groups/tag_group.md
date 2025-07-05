Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](tag_group.md)

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

# TagGroup

A way to group related tags.
For example you could have a "Life Stage" tag group
with tags like "Child", "Teen", "Adult", etc.

[# Example Request](#/apps/groups/2023-07-10/vertices/tag_group#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/tag_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/tag_groups)

[# Example Object](#/apps/groups/2023-07-10/vertices/tag_group#example-object)

```
{
  "type": "TagGroup",
  "id": "1",
  "attributes": {
    "display_publicly": true,
    "multiple_options_enabled": true,
    "name": "string",
    "position": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/tag_group#attributes)

Name

Type

Description

`id`

`primary_key`

`display_publicly`

`boolean`

Whether or not this tag group is visible to the public on Church Center

`multiple_options_enabled`

`boolean`

Whether or not a group can belong to many tags within this tag group

`name`

`string`

The name of the tag group

`position`

`integer`

The position of the tag group in relation to other tag groups

[# URL Parameters](#/apps/groups/2023-07-10/vertices/tag_group#url-parameters)

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/tag_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/tag_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/tag_groups/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/tag_group#associations)

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/tag_groups/{tag_group_id}/tags`

Copy

[Tag](tag.md)

tags belonging to this tag group

[# Belongs To](#/apps/groups/2023-07-10/vertices/tag_group#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/tag_groups`

Copy

[Organization](organization.md)

tag groups in this organization

* `public` — where `display_publicly` is enabled