Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](enrollment.md)

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

# Enrollment

Details on how and when members can join a `Group`.

[# Example Request](#/apps/groups/2023-07-10/vertices/enrollment#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/groups/{group_id}/enrollment
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/groups/{group_id}/enrollment)

[# Example Object](#/apps/groups/2023-07-10/vertices/enrollment#example-object)

```
{
  "type": "Enrollment",
  "id": "1",
  "attributes": {
    "auto_closed": true,
    "auto_closed_reason": "string",
    "date_limit": "string",
    "date_limit_reached": true,
    "member_limit": 1,
    "member_limit_reached": true,
    "status": "string",
    "strategy": "string"
  },
  "relationships": {
    "group": {
      "data": {
        "type": "Group",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/enrollment#attributes)

Name

Type

Description

`id`

`primary_key`

`auto_closed`

`boolean`

Whether or not enrollment has been closed automatically due to set limits

`auto_closed_reason`

`string`

Brief description as to which limit automatically closed enrollment

`date_limit`

`string`

Date when enrollment should automatically close

`date_limit_reached`

`boolean`

Whether or not the `date_limit` has been reached

`member_limit`

`integer`

Total number of members allowed before enrollment should automatically close

`member_limit_reached`

`boolean`

Whether or not the `member_limit` has been reached

`status`

`string`

Current enrollment status. Possible values:

* `open` - strategy is not `closed` and no limits have been reached
* `closed` - strategy is `closed`

  or

  limits have been reached
* `full` - member limit has been reached
* `private` - group is unlisted

`strategy`

`string`

Sign up strategy. Possible values: `request_to_join`, `open_signup`, or `closed`

[# Relationships](#/apps/groups/2023-07-10/vertices/enrollment#relationships)

Name

Type

Association Type

Note

group

Group

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/enrollment#url-parameters)

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/enrollment#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/groups/{group_id}/enrollment`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/groups/{group_id}/enrollment/{id}`

Copy

[# Belongs To](#/apps/groups/2023-07-10/vertices/enrollment#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/enrollment`

Copy

[Group](group.md)

enrollment details for this group