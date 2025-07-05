Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

A person is a user of Planning Center.
They can be a member of a group, a leader of a group, or an administrator.

[# Example Request](#/apps/groups/2023-07-10/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/people)

[# Example Object](#/apps/groups/2023-07-10/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "addresses": [],
    "avatar_url": "string",
    "child": true,
    "created_at": "2000-01-01T12:00:00Z",
    "email_addresses": [],
    "first_name": "string",
    "last_name": "string",
    "permissions": "string",
    "phone_numbers": []
  },
  "relationships": {}
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

`addresses`

`array`

Returns all the addresses associated with this person.

`avatar_url`

`string`

The URL of the person's avatar.

`child`

`boolean`

Whether or not the person is under 13 years old.
This is false if a birthdate is not set.

Only available when requested with the `?fields` param

`created_at`

`date_time`

Date and time this person was first created in Planning Center

`email_addresses`

`array`

Returns all the email addresses associated with this person.

```


```
[{
  "address": "sam@example.com",
  "location": "Home",
  "primary": true
}]

```


```

`first_name`

`string`

The person's first name.

`last_name`

`string`

The person's last name.

`permissions`

`string`

Can be `administrator`, `group_type_manager`, `leader`, `member`, or `no access`.

`phone_numbers`

`array`

Returns all the phone numbers associated with this person.

```


```
[{
  "number": "(800) 123-4567",
  "carrier": null,
  "location": "Mobile",
  "primary": true
}]

```


```

[# URL Parameters](#/apps/groups/2023-07-10/vertices/person#url-parameters)

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

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

first\_name

where[first\_name]

string

Query on a specific first\_name

`?where[first_name]=string`

last\_name

where[last\_name]

string

Query on a specific last\_name

`?where[last_name]=string`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/people/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/person#associations)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/people/{person_id}/events`

Copy

[Event](event.md)

events of groups which this person is a member

* `canceled` — has a `canceled_at` date and time
* `not_canceled` — does not have a `canceled_at` date and time

# groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/people/{person_id}/groups`

Copy

[Group](group.md)

groups of which this person is a member

# memberships

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/people/{person_id}/memberships`

Copy

[Membership](membership.md)

memberships for this person

[# Belongs To](#/apps/groups/2023-07-10/vertices/person#belongs-to)

# Attendance

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events/{event_id}/attendances/{attendance_id}/person`

Copy

[Attendance](attendance.md)

person belonging to this attendance

# GroupApplication

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_applications/{group_application_id}/person`

Copy

[GroupApplication](group_application.md)

person who applied

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/people`

Copy

[Group](group.md)

people who have memberships for this group

# Membership

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/memberships/{membership_id}/person`

Copy

[Membership](membership.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/people`

Copy

[Organization](organization.md)

people for this organization