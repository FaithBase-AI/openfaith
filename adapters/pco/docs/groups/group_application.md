Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](group_application.md)

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

# GroupApplication

A group application is a request to join a group which can be approved or rejected.

[# Example Request](#/apps/groups/2023-07-10/vertices/group_application#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/group_applications
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/group_applications)

[# Example Object](#/apps/groups/2023-07-10/vertices/group_application#example-object)

```
{
  "type": "GroupApplication",
  "id": "1",
  "attributes": {
    "applied_at": "2000-01-01T12:00:00Z",
    "message": "string",
    "status": "string"
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

[# Attributes](#/apps/groups/2023-07-10/vertices/group_application#attributes)

Name

Type

Description

`id`

`primary_key`

`applied_at`

`date_time`

Timestamp when this person applied.

`message`

`string`

An optional personal message from the applicant.

`status`

`string`

The approval status of the application.

Possible values: `pending`, `approved`, or `rejected`

[# Relationships](#/apps/groups/2023-07-10/vertices/group_application#relationships)

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

[# URL Parameters](#/apps/groups/2023-07-10/vertices/group_application#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

group

include associated group

create and update

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

applied\_at

string

prefix with a hyphen (-applied\_at) to reverse the order

order

status

string

prefix with a hyphen (-status) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

applied\_at

where[applied\_at]

date\_time

Query on a specific applied\_at

`?where[applied_at]=2000-01-01T12:00:00Z`

status

where[status]

string

Query on a specific status

`?where[status]=string`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/group_application#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/group_applications`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/group_applications/{id}`

Copy

[# Actions](#/apps/groups/2023-07-10/vertices/group_application#actions)

# approve

HTTP Method

Endpoint

POST

`/groups/v2/group_applications/{group_application_id}/approve`

Copy

Details:

This action can be used to approve a group application and immediately
add the person to the group. You can optionally provide a `role` attribute
as `member` (default) or `leader`. Only administrators or managers can
create leaders.

Returns:

The group application you've approved.

Example Post Body:

```
{
  "data": {
    "type": "GroupApplicationApproveAction",
    "attributes": {
      "role": "member"
    }
  }
}
```

Permissions:

Can only be run on a pending application by an administrator, manager, or group leader

# reject

HTTP Method

Endpoint

POST

`/groups/v2/group_applications/{group_application_id}/reject`

Copy

Details:

This action can be used to reject a group application. The person will not
be added to the group.

Returns:

The group application you've rejected.

Permissions:

Can only be run on a pending application by an administrator, manager, or group leader

[# Associations](#/apps/groups/2023-07-10/vertices/group_application#associations)

# group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_applications/{group_application_id}/group`

Copy

[Group](group.md)

group being applied to

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/group_applications/{group_application_id}/person`

Copy

[Person](person.md)

person who applied

[# Belongs To](#/apps/groups/2023-07-10/vertices/group_application#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/applications`

Copy

[Group](group.md)

requests to join this group

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_applications`

Copy

[Organization](organization.md)

requests to join groups for this organization