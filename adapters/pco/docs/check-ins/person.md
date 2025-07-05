Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)

2025-05-28

Info

[AttendanceType](attendance_type.md)

[CheckIn](check_in.md)

[CheckInGroup](check_in_group.md)

[CheckInTime](check_in_time.md)

[Event](event.md)

[EventLabel](event_label.md)

[EventPeriod](event_period.md)

[EventTime](event_time.md)

[Headcount](headcount.md)

[IntegrationLink](integration_link.md)

[Label](label.md)

[Location](location.md)

[LocationEventPeriod](location_event_period.md)

[LocationEventTime](location_event_time.md)

[LocationLabel](location_label.md)

[Option](option.md)

[Organization](organization.md)

[Pass](pass.md)

[Person](person.md)

[PersonEvent](person_event.md)

[PreCheck](pre_check.md)

[RosterListPerson](roster_list_person.md)

[Station](station.md)

[Theme](theme.md)

[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Person

An attendee, volunteer or administrator.

Usually

, a person who checked in will be present as a `Person`. In some cases, they may not be present:

* The person was manually deleted from the admin interface
* The check-in was created as a "Visitor - Label Only" (which doesn't create a corresponding person record)

[# Example Request](#/apps/check-ins/2025-05-28/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/people)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "addresses": [],
    "email_addresses": [],
    "phone_numbers": [],
    "avatar_url": "string",
    "name_prefix": "string",
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "name_suffix": "string",
    "birthdate": "2000-01-01",
    "grade": 1,
    "gender": "string",
    "medical_notes": "string",
    "child": true,
    "permission": "string",
    "headcounter": true,
    "last_checked_in_at": "2000-01-01T12:00:00Z",
    "check_in_count": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "passed_background_check": true,
    "demographic_avatar_url": "string",
    "name": "string",
    "top_permission": "string",
    "ignore_filters": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

`addresses`

`array`

`email_addresses`

`array`

`phone_numbers`

`array`

`avatar_url`

`string`

`name_prefix`

`string`

`first_name`

`string`

`middle_name`

`string`

`last_name`

`string`

`name_suffix`

`string`

`birthdate`

`date`

`grade`

`integer`

`gender`

`string`

`medical_notes`

`string`

`child`

`boolean`

`permission`

`string`

`headcounter`

`boolean`

`last_checked_in_at`

`date_time`

`check_in_count`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`passed_background_check`

`boolean`

`demographic_avatar_url`

`string`

`name`

`string`

`top_permission`

`string`

`ignore_filters`

`boolean`

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/person#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

organization

include associated organization

# Order By

Parameter

Value

Type

Description

order

check\_in\_count

string

prefix with a hyphen (-check\_in\_count) to reverse the order

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_checked\_in\_at

string

prefix with a hyphen (-last\_checked\_in\_at) to reverse the order

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

headcounter

where[headcounter]

boolean

Query on a specific headcounter

`?where[headcounter]=true`

ignore\_filters

where[ignore\_filters]

boolean

Query on a specific ignore\_filters

`?where[ignore_filters]=true`

permission

where[permission]

string

Query on a specific permission

`?where[permission]=string`

search\_name

where[search\_name]

string

Search by person name (first, last, combination)

`?where[search_name]=string`

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/people/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/person#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/check_ins`

Copy

[CheckIn](check_in.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# organization

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/organization`

Copy

[Organization](organization.md)

# passes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/passes`

Copy

[Pass](pass.md)

# person\_events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/person_events`

Copy

[PersonEvent](person_event.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/person#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_in_by`

Copy

[CheckIn](check_in.md)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_out_by`

Copy

[CheckIn](check_in.md)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/person`

Copy

[CheckIn](check_in.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/people`

Copy

[Organization](organization.md)

# Pass

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/passes/{pass_id}/person`

Copy

[Pass](pass.md)

# PersonEvent

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/person`

Copy

[PersonEvent](person_event.md)