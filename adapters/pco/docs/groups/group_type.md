Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](group_type.md)

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

# GroupType

A group type is a category of groups.
For example, a church might have group types for "Small Groups" and "Classes".

[# Example Request](#/apps/groups/2023-07-10/vertices/group_type#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/group_types
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/group_types)

[# Example Object](#/apps/groups/2023-07-10/vertices/group_type#example-object)

```
{
  "type": "GroupType",
  "id": "1",
  "attributes": {
    "church_center_visible": true,
    "church_center_map_visible": true,
    "color": "string",
    "default_group_settings": "string",
    "description": "string",
    "name": "string",
    "position": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/group_type#attributes)

Name

Type

Description

`id`

`primary_key`

`church_center_visible`

`boolean`

`true` if the group type contains any published groups. Otherwise `false`.

`church_center_map_visible`

`boolean`

`true` if the map view is visible on the public groups list page. Otherwise `false`.

`color`

`string`

Hex color value. Color themes are a visual tool for administrators on the admin side of Groups.
Ex: "#4fd2e3"

`default_group_settings`

`string`

A JSON object of default settings for groups of this type.

`description`

`string`

A description of the group type

`name`

`string`

The name of the group type

`position`

`integer`

The position of the group type in relation to other group types.

[# URL Parameters](#/apps/groups/2023-07-10/vertices/group_type#url-parameters)

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/group_type#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/group_types`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/group_types/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/group_type#associations)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/events`

Copy

[Event](event.md)

events of groups with this group type

* `canceled` — has a `canceled_at` date and time
* `not_canceled` — do not have a `canceled_at` date and time
* `upcoming` — future `starts_at` date and time

# groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/groups`

Copy

[Group](group.md)

groups belonging to this group type

# resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/resources`

Copy

[Resource](resource.md)

file or link resources shared with all groups in this group type

[# Belongs To](#/apps/groups/2023-07-10/vertices/group_type#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/group_type`

Copy

[Group](group.md)

group type of this group

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types`

Copy

[Organization](organization.md)

group types for this organization

* `church_center_visible` — contains groups which are published to Church Center
* `not_church_center_visible` — does not contain any groups published to Church Center