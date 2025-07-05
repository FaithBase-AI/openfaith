Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event.md)

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

# Event

An event is a meeting of a group. It has a start and end time, and can be
either physical or virtual.

[# Example Request](#/apps/groups/2023-07-10/vertices/event#example-request)

```
curl https://api.planningcenteronline.com/groups/v2/events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/groups/v2/events)

[# Example Object](#/apps/groups/2023-07-10/vertices/event#example-object)

```
{
  "type": "Event",
  "id": "1",
  "attributes": {
    "attendance_requests_enabled": true,
    "automated_reminder_enabled": true,
    "canceled": true,
    "canceled_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "ends_at": "2000-01-01T12:00:00Z",
    "location_type_preference": "string",
    "multi_day": true,
    "name": "string",
    "reminders_sent": true,
    "reminders_sent_at": "2000-01-01T12:00:00Z",
    "repeating": true,
    "starts_at": "2000-01-01T12:00:00Z",
    "virtual_location_url": "string",
    "visitors_count": 1
  },
  "relationships": {
    "attendance_submitter": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "group": {
      "data": {
        "type": "Group",
        "id": "1"
      }
    },
    "location": {
      "data": {
        "type": "Location",
        "id": "1"
      }
    },
    "repeating_event": {
      "data": {
        "type": "RepeatingEvent",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/groups/2023-07-10/vertices/event#attributes)

Name

Type

Description

`id`

`primary_key`

`attendance_requests_enabled`

`boolean`

This is a group setting that applies to all the events in the group.
If selected, an email will be sent to the primary email address of the group leader
60 minutes before the event start time, asking them to report attendance.

`automated_reminder_enabled`

`boolean`

If `true`, we send an event remind some specified time before the event starts
to all members in the group.

`canceled`

`boolean`

Whether or not the event has been canceled.

`canceled_at`

`date_time`

The date and time the event was canceled.

`description`

`string`

A longform description of the event. Can contain HTML markup.

`ends_at`

`date_time`

The date and time the event ends.

`location_type_preference`

`string`

Either "physical" or "virtual".

`multi_day`

`boolean`

`true` if the event spans multiple days. Otherwise `false`.

`name`

`string`

The name/title of the event.

`reminders_sent`

`boolean`

`true` if reminders have been sent for this event. Otherwise `false`.

`reminders_sent_at`

`date_time`

The date and time reminders were sent for this event.

`repeating`

`boolean`

`true` if the event is a repeating event. Otherwise `false`.

`starts_at`

`date_time`

The date and time the event starts.

`virtual_location_url`

`string`

The URL for the virtual location. Typically we don't show this URL unless
unless the location\_type\_preference is "virtual".

`visitors_count`

`integer`

The number of visitors who attended the event. These are people who are not
members of the group.

[# Relationships](#/apps/groups/2023-07-10/vertices/event#relationships)

Name

Type

Association Type

Note

attendance\_submitter

Person

to\_one

group

Group

to\_one

location

Location

to\_one

repeating\_event

RepeatingEvent

to\_one

[# URL Parameters](#/apps/groups/2023-07-10/vertices/event#url-parameters)

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

location

include associated location

create and update

# Order By

Parameter

Value

Type

Description

order

ends\_at

string

prefix with a hyphen (-ends\_at) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

ends\_at

where[ends\_at]

date\_time

Query on a specific ends\_at

`?where[ends_at]=2000-01-01T12:00:00Z`

name

where[name]

string

Query on a specific name

`?where[name]=string`

starts\_at

where[starts\_at]

date\_time

Query on a specific starts\_at

`?where[starts_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/groups/2023-07-10/vertices/event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/groups/v2/events`

Copy

# Reading

HTTP Method

Endpoint

GET

`/groups/v2/events/{id}`

Copy

[# Associations](#/apps/groups/2023-07-10/vertices/event#associations)

# attendances

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/attendances`

Copy

[Attendance](attendance.md)

attendances recorded for this event

* `attended` — where `attended` is `true`

# group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/group`

Copy

[Group](group.md)

group which the event belongs to

# location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/location`

Copy

[Location](location.md)

physical location of the event

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/groups/v2/events/{event_id}/notes`

Copy

[EventNote](event_note.md)

notes added to the event

[# Belongs To](#/apps/groups/2023-07-10/vertices/event#belongs-to)

# Group

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/groups/{group_id}/events`

Copy

[Group](group.md)

events for this group

* `canceled` — have a `canceled_at` date and time
* `not_canceled` — do not have a `canceled_at` date and time

# GroupType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/group_types/{group_type_id}/events`

Copy

[GroupType](group_type.md)

events of groups with this group type

* `canceled` — has a `canceled_at` date and time
* `not_canceled` — do not have a `canceled_at` date and time
* `upcoming` — future `starts_at` date and time

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/events`

Copy

[Organization](organization.md)

events for all groups in this organization

* `canceled` — has a `canceled_at` date and time
* `group` — from specific groups; provide an additional `group_id` param
  as a comma-separated list of IDs, ex: `?filter=group&group_id=1,2,3`
* `group_type` — from specific group types; provide an additional `group_type_id` param
  as a comma-separated list of IDs, ex: `?filter=group_type&group_type_id=1,2,3`
* `my_groups` — only group events of which you are a member
* `not_canceled` — does not have a `canceled_at` date and time
* `upcoming` — future `starts_at` date and time

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/groups/v2/people/{person_id}/events`

Copy

[Person](person.md)

events of groups which this person is a member

* `canceled` — has a `canceled_at` date and time
* `not_canceled` — does not have a `canceled_at` date and time