Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](group.md)

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

# Group

A group of people that meet together regularly.

[# Example Request](#/apps/groups/2023-07-10/vertices/group#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/groups)

[# Example Object](#/apps/groups/2023-07-10/vertices/group#example-object)

```
{
  "type": "Group",
  "id": "1",
  "attributes": {
    "archived_at": "2000-01-01T12:00:00Z",
    "can_create_conversation": true,
    "chat_enabled": true,
    "contact_email": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "events_visibility": "value",
    "header_image": {},
    "leaders_can_search_people_database": true,
    "location_type_preference": "value",
    "members_are_confidential": true,
    "memberships_count": 1,
    "name": "string",
    "public_church_center_web_url": "string",
    "schedule": "string",
    "tag_ids": 1,
    "virtual_location_url": "string",
    "widget_status": {}
  },
  "relationships": {
    "group_type": {
      "data": {
        "type": "GroupType",
        "id": "1"
      }
    },
    "location": {
      "data": {
        "type": "Location",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/group#attributes)

Name

Type

Description

`id`

`primary_key`

`archived_at`

`date_time`

The date and time the group was archived.

`can_create_conversation`

`boolean`

A boolean representing the current user's authorization to start a new conversation in the group.

Only available when requested with the `?fields` param

`chat_enabled`

`boolean`

A boolean representing whether or not the group has Chat enabled.

`contact_email`

`string`

If a contact\_email is provided, we will display a contact button on the public page
where potential members can ask questions before joining the group.

`created_at`

`date_time`

The date and time the group was created.

`description`

`string`

A longform description of the group. Can contain HTML markup.

`events_visibility`

`string`

The visibility of events for the group.

Possible values: `public` or `members`

`header_image`

`hash`

A hash of header image URLs. The keys are `thumbnail`, `medium`, and `original`.

```


```
{
  "thumbnail": "https://groups-production.s3.amazonaws.com/uploads/group/header_image/1986065/thumbnail_image-1676676396838.jpg",
  "medium": "https://groups-production.s3.amazonaws.com/uploads/group/header_image/1986065/medium_image-1676676396838.jpg",
  "original": "https://groups-production.s3.amazonaws.com/uploads/group/header_image/1986065/image-1676676396838.jpg"
}

```


```

`leaders_can_search_people_database`

`boolean`

Whether or not group leaders have access to the entire
church database on the admin side of Groups. (Not recommended)

`location_type_preference`

`string`

The location type preference for the group.

Possible values: `physical` or `virtual`

`members_are_confidential`

`boolean`

Whether or not group members can see other members' info

`memberships_count`

`integer`

The number of members in the group, includes leaders.
Does not include membership requests.

`name`

`string`

The name/title of the group.

`public_church_center_web_url`

`string`

The public URL for the group on Church Center.

`schedule`

`string`

A text summary of the group's typical meeting schedule.
Can be a string like "Sundays at 9:30am" or "Every other Tuesday at 7pm".

`tag_ids`

`integer`

The IDs of the tags associated with the group.

Only available when requested with the `?fields` param

`virtual_location_url`

`string`

The URL for the group's virtual location. A zoom link, for example.
This could be set even if `location_type_preference` is `physical`.
This is useful if you want to display a zoom link even if the group is meeting in person.

`widget_status`

`hash`

DEPRECATED: This is a private attribute used by Home widgets that we plan to remove soon.

Only available when requested with the `?fields` param

[# Relationships](#/apps/groups/2023-07-10/vertices/group#relationships)

Name

Type

Association Type

Note

group\_type

GroupType

to\_one

The group type that this group belongs to.
Unique groups do not belong to a group type
and will return a `null` data set for the relationship.

location

Location

to\_one

The group's default location is where the group normally meets.
But remember, each group event can have its own location if needed.

[# URL Parameters](#/apps/groups/2023-07-10/vertices/group#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

enrollment

include associated enrollment

include

group\_type

include associated group\_type

create and update

include

location

include associated location

create and update

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

archive\_status

where[archive\_status]

string

Query on a specific archive\_status

Possible values: `not_archived`, `only`, or `include`

`?where[archive_status]=value`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/groups/{id}`

Copy

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/groups/v2/groups/{id}`

Copy

* name
* group\_type\_id
* schedule
* tag\_ids

[# Actions](#/apps/groups/2023-07-10/vertices/group#actions)

# assign\_campuses

HTTP Method

Endpoint

POST

`/groups/v2/groups/{group_id}/assign_campuses`

Copy

Details:

This action can be used to assign campuses to a group.
All campuses will be replaced so the full data set must be sent.

Returns:

No content

Example Post Body:

```
{
  "data": {
    "type": "GroupAssignCampuses",
    "attributes": {
      "campus_ids": [
        "1",
        "2"
      ]
    }
  }
}
```

Permissions:

Must be an administrator, group type manager, or leader.

# disable\_chat

HTTP Method

Endpoint

POST

`/groups/v2/groups/{group_id}/disable_chat`

Copy

Details:

Disables chat for the given group. This will hide chat from the group.
You must confirm your intention with a `confirm` attribute to allow this action to succeed.

Returns:

The updated group.

Example Post Body:

```
{
  "data": {
    "type": "GroupDisableChat",
    "attributes": {
      "confirm": true
    }
  }
}
```

Permissions:

Can be run by administrators or group type managers,
as well as leaders if allowed by the group type's settings.

# enable\_chat

HTTP Method

Endpoint

POST

`/groups/v2/groups/{group_id}/enable_chat`

Copy

Details:

Enables chat for the given group. Enabling chat will make the names of each member visible to
other group members. Chat cannot be enabled for a group if the member list is confidential.
You must confirm your intention with a `confirm` attribute to allow this action to succeed.

Returns:

The updated group.

Example Post Body:

```
{
  "data": {
    "type": "GroupEnableChat",
    "attributes": {
      "confirm": true
    }
  }
}
```

Permissions:

Can be run by administrators or group type managers,
as well as leaders if allowed by the group type's settings.

[# Associations](#/apps/groups/2023-07-10/vertices/group#associations)

# applications

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/applications`

Copy

[GroupApplication](group_application.md)

requests to join this group

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/campuses`

Copy

[Campus](campus.md)

campuses assigned this group

# enrollment

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/enrollment`

Copy

[Enrollment](enrollment.md)

enrollment details for this group

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/events`

Copy

[Event](event.md)

events for this group

* `canceled` — have a `canceled_at` date and time
* `not_canceled` — do not have a `canceled_at` date and time

# group\_type

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/group_type`

Copy

[GroupType](group_type.md)

group type of this group

# location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/location`

Copy

[Location](location.md)

default physical location for this group's events

# memberships

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships`

Copy

[Membership](membership.md)

memberships belonging to this group

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/people`

Copy

[Person](person.md)

people who have memberships for this group

# resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/resources`

Copy

[Resource](resource.md)

file and link resources shared with this group

* `leaders` — only visible to group leaders

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/groups/{group_id}/tags`

Copy

[Tag](tag.md)

tags assigned to this group

[# Belongs To](#/apps/groups/2023-07-10/vertices/group#belongs-to)

# Campus

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/campuses/{campus_id}/groups`

Copy

[Campus](campus.md)

groups which have applied this campus

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/group`

Copy

[Event](event.md)

group which the event belongs to

# GroupApplication

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_applications/{group_application_id}/group`

Copy

[GroupApplication](group_application.md)

group being applied to

# GroupType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/groups`

Copy

[GroupType](group_type.md)

groups belonging to this group type

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/locations/{location_id}/group`

Copy

[Location](location.md)

group that manages this location

# Membership

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships/{membership_id}/group`

Copy

[Membership](membership.md)

group for this membership

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups`

Copy

[Organization](organization.md)

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

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/people/{person_id}/groups`

Copy

[Person](person.md)

groups of which this person is a member

# Tag

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/tags/{tag_id}/groups`

Copy

[Tag](tag.md)

groups which have applied this tag