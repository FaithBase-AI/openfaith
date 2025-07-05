Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](campus.md)

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

# Campus

A campus as defined in Planning Center Accounts

[# Example Request](#/apps/groups/2023-07-10/vertices/campus#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/campuses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/campuses)

[# Example Object](#/apps/groups/2023-07-10/vertices/campus#example-object)

```
{
  "type": "Campus",
  "id": "1",
  "attributes": {
    "name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/campus#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

The name of the campus

[# URL Parameters](#/apps/groups/2023-07-10/vertices/campus#url-parameters)

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/campus#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/campuses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/campuses/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/campus#associations)

# groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/campuses/{campus_id}/groups`

Copy

[Group](group.md)

groups which have applied this campus

[# Belongs To](#/apps/groups/2023-07-10/vertices/campus#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/campuses`

Copy

[Group](group.md)

campuses assigned this group

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/campuses`

Copy

[Organization](organization.md)

campuses for this organization