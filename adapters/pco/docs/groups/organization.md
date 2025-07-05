Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

The organization represents a single church. Every other resource is scoped to this record.

[# Example Request](#/apps/groups/2023-07-10/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/groups/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2)

[# Example Object](#/apps/groups/2023-07-10/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "time_zone": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

The name of the organization.

`time_zone`

`string`

The time zone of the organization.

[# URL Parameters](#/apps/groups/2023-07-10/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/organization#associations)

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/campuses`

Copy

[Campus](campus.md)

campuses for this organization

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events`

Copy

[Event](event.md)

events for all groups in this organization

* `canceled` — has a `canceled_at` date and time
* `group` — from specific groups; provide an additional `group_id` param
  as a comma-separated list of IDs, ex: `?filter=group&group_id=1,2,3`
* `group_type` — from specific group types; provide an additional `group_type_id` param
  as a comma-separated list of IDs, ex: `?filter=group_type&group_type_id=1,2,3`
* `my_groups` — only group events of which you are a member
* `not_canceled` — does not have a `canceled_at` date and time
* `upcoming` — future `starts_at` date and time

# group\_applications

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_applications`

Copy

[GroupApplication](group_application.md)

requests to join groups for this organization

# group\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_types`

Copy

[GroupType](group_type.md)

group types for this organization

* `church_center_visible` — contains groups which are published to Church Center
* `not_church_center_visible` — does not contain any groups published to Church Center

# groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups`

Copy

[Group](group.md)

groups for this organization

* `campus` — from specific campuses; provide an additional `campus_id` param
  as a comma-separated list of IDs, ex: `?filter=campus&campus_id=1,2,3`
* `group` — from specific groups; provide an additional `group_id` param
  as a comma-separated list of IDs, ex: `?filter=group&group_id=1,2,3`
* `group_type` — from specific group types; provide an additional `group_type_id` param
  as a comma-separated list of IDs, ex: `?filter=group_type&group_type_id=1,2,3`
* `my_groups` — only groups of which you are a member
* `people_database_searchable` — based on their setting of allowing leaders to search the entire
  church database in Groups; provide an additional
  `people_database_searchable` param with `only` or `none`,
  ex: `?filter=people_database_searchable&people_database_searchable=only`

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/people`

Copy

[Person](person.md)

people for this organization

# tag\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/tag_groups`

Copy

[TagGroup](tag_group.md)

tag groups in this organization

* `public` — where `display_publicly` is enabled