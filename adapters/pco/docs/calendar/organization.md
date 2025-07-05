Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)

2022-07-07

Info

[Attachment](attachment.md)

[Conflict](conflict.md)

[Event](event.md)

[EventConnection](event_connection.md)

[EventInstance](event_instance.md)

[EventResourceAnswer](event_resource_answer.md)

[EventResourceRequest](event_resource_request.md)

[EventTime](event_time.md)

[Feed](feed.md)

[JobStatus](job_status.md)

[Organization](organization.md)

[Person](person.md)

[ReportTemplate](report_template.md)

[RequiredApproval](required_approval.md)

[Resource](resource.md)

[ResourceApprovalGroup](resource_approval_group.md)

[ResourceBooking](resource_booking.md)

[ResourceFolder](resource_folder.md)

[ResourceQuestion](resource_question.md)

[ResourceSuggestion](resource_suggestion.md)

[RoomSetup](room_setup.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Organization

An administrative structure, usually representing a single church.
Contains date/time formatting and time zone preferences.

[# Example Request](#/apps/calendar/2022-07-07/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2)

[# Example Object](#/apps/calendar/2022-07-07/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "time_zone": "string",
    "twenty_four_hour_time": true,
    "date_format": "string",
    "onboarding": true,
    "calendar_starts_on": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the organization

`name`

`string`

The name of the organization

`time_zone`

`string`

The time zone of the organization

`twenty_four_hour_time`

`boolean`

* `true` indicates hours for times will use a 24-hour clock
* `false` indicates hours for times will use a 12-hour clock

`date_format`

`string`

Possible values:

* `%d/%m/%Y`: indicates date/month/year formatting
* `%m/%d/%Y`: indicates month/date/year formatting

`onboarding`

`boolean`

Only available when requested with the `?fields` param

`calendar_starts_on`

`string`

The day of the week the calendar starts on

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/organization#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/attachments`

Copy

[Attachment](attachment.md)

# conflicts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/conflicts`

Copy

[Conflict](conflict.md)

* `future`
* `resolved`
* `unresolved`

# event\_instances

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances`

Copy

[EventInstance](event_instance.md)

* `all` — filter to instances you approve, manage, own, or subscribe to; can't be combined with any other user scopes
* `approved` — filter to instances that are approved; can't be combined with any other `approved` scopes
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `approver` — filter to instances you approve; can't be combined with any other `approver` scopes
* `approver_subscriber`
* `future`
* `lost`
* `manager` — filter to instances you manage; can't be combined with any other `manager` scopes
* `manager_approver`
* `manager_approver_subscriber`
* `manager_subscriber`
* `owner` — filter to instances you own; can't be combined with any other `owner` scopes
* `owner_approver`
* `owner_approver_subscriber`
* `owner_manager`
* `owner_manager_approver`
* `owner_manager_approver_subscriber`
* `owner_manager_subscriber`
* `owner_subscriber`
* `pending` — filter to instances that are pending; can't be combined with any other `pending` scopes
* `pending_rejected`
* `rejected` — filter to instances that are rejected; can't be combined with any other `rejected` scopes
* `shared`
* `subscriber` — filter to instances you subscribe to; can't be combined with any other `subscriber` scopes
* `unresolved`

# event\_resource\_requests

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_resource_requests`

Copy

[EventResourceRequest](event_resource_request.md)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/events`

Copy

[Event](event.md)

* `future`

# feeds

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/feeds`

Copy

[Feed](feed.md)

# job\_statuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/job_statuses`

Copy

[JobStatus](job_status.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/people`

Copy

[Person](person.md)

* `active`
* `event_owners`

# report\_templates

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/report_templates`

Copy

[ReportTemplate](report_template.md)

# resource\_approval\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups`

Copy

[ResourceApprovalGroup](resource_approval_group.md)

# resource\_bookings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_bookings`

Copy

[ResourceBooking](resource_booking.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`
* `resources`
* `rooms`

# resource\_folders

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_folders`

Copy

[ResourceFolder](resource_folder.md)

* `resources`
* `rooms`

# resource\_questions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_questions`

Copy

[ResourceQuestion](resource_question.md)

# resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources`

Copy

[Resource](resource.md)

* `resources`
* `rooms`

# room\_setups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/room_setups`

Copy

[RoomSetup](room_setup.md)

* `shared_room_setups`

# tag\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tag_groups`

Copy

[TagGroup](tag_group.md)

* `required`

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tags`

Copy

[Tag](tag.md)

* `individual`

[# Belongs To](#/apps/calendar/2022-07-07/vertices/organization#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/people/{person_id}/organization`

Copy

[Person](person.md)