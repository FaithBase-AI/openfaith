Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](membership.md)

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

# Membership

The state of a `Person` belonging to a `Group`.

A `Person` can only have one active `Membership` to a `Group` at a time.

[# Example Request](#/apps/groups/2023-07-10/vertices/membership#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/groups/{group_id}/memberships
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/groups/{group_id}/memberships)

[# Example Object](#/apps/groups/2023-07-10/vertices/membership#example-object)

```
{
  "type": "Membership",
  "id": "1",
  "attributes": {
    "joined_at": "2000-01-01T12:00:00Z",
    "role": "string"
  },
  "relationships": {
    "group": {
      "data": {
        "type": "Group",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/membership#attributes)

Name

Type

Description

`id`

`primary_key`

`joined_at`

`date_time`

The date and time the person joined the group.

`role`

`string`

The role of the person in the group.
Possible values: `member` or `leader`

[# Relationships](#/apps/groups/2023-07-10/vertices/membership#relationships)

Name

Type

Association Type

Note

group

Group

to\_one

person

Person

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/membership#url-parameters)

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

joined\_at

string

prefix with a hyphen (-joined\_at) to reverse the order

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

`?where[role]=string`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/membership#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/groups/{group_id}/memberships`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/groups/{group_id}/memberships/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/groups/v2/groups/{group_id}/memberships`

Copy

* joined\_at
* role
* person\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/groups/v2/groups/{group_id}/memberships/{id}`

Copy

* joined\_at
* role

# Deleting

HTTP Method

Endpoint

DELETE

`/groups/v2/groups/{group_id}/memberships/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/membership#associations)

# group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships/{membership_id}/group`

Copy

[Group](group.md)

group for this membership

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships/{membership_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/groups/2023-07-10/vertices/membership#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships`

Copy

[Group](group.md)

memberships belonging to this group

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/people/{person_id}/memberships`

Copy

[Person](person.md)

memberships for this person