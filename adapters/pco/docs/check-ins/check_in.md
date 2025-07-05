Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](check_in.md)

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

# CheckIn

An attendance record for an event.

If someone was checked out, `checked_out_at` will be present.

You can scope check-ins in a few ways:

* `regular`s, `guest`s, and `volunteer`s correspond to the option selected when checking in.
* `attendee`s are `regular`s and `guest`s together.
* `one_time_guest`s are check-ins which were created without a corresponding person record.
* `not_one_time_guest`s are check-ins which had a corresponding person record when they were created.
* `checked_out` are check-ins where `checked_out_at` is present (meaning they were checked out from a station).
* `first_time`s are check-ins which are the person's first for a given event. (Label-only visitors are not included here.)

[# Example Request](#/apps/check-ins/2025-05-28/vertices/check_in#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/check_ins
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/check_ins)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/check_in#example-object)

```
{
  "type": "CheckIn",
  "id": "1",
  "attributes": {
    "first_name": "string",
    "last_name": "string",
    "medical_notes": "string",
    "number": 1,
    "security_code": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "checked_out_at": "2000-01-01T12:00:00Z",
    "confirmed_at": "2000-01-01T12:00:00Z",
    "emergency_contact_name": "string",
    "emergency_contact_phone_number": "string",
    "one_time_guest": true,
    "kind": "string"
  },
  "relationships": {
    "event_period": {
      "data": {
        "type": "EventPeriod",
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

[# Attributes](#/apps/check-ins/2025-05-28/vertices/check_in#attributes)

Name

Type

Description

`id`

`primary_key`

`first_name`

`string`

`last_name`

`string`

`medical_notes`

`string`

`number`

`integer`

`security_code`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`checked_out_at`

`date_time`

`confirmed_at`

`date_time`

`emergency_contact_name`

`string`

`emergency_contact_phone_number`

`string`

`one_time_guest`

`boolean`

`kind`

`string`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/check_in#relationships)

Name

Type

Association Type

Note

event\_period

EventPeriod

to\_one

person

Person

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/check_in#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

check\_in\_times

include associated check\_in\_times

include

checked\_in\_at

include associated checked\_in\_at

include

checked\_in\_by

include associated checked\_in\_by

include

checked\_out\_by

include associated checked\_out\_by

include

event

include associated event

create

include

event\_period

include associated event\_period

create and update

include

event\_times

include associated event\_times

include

locations

include associated locations

include

options

include associated options

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

checked\_out\_at

string

prefix with a hyphen (-checked\_out\_at) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

order

number

string

prefix with a hyphen (-number) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

account\_center\_person\_id

where[account\_center\_person\_id]

integer

Query on a related person

`?where[account_center_person_id]=1`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

security\_code

where[security\_code]

string

Query on a specific security\_code

`?where[security_code]=string`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/check_in#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/check_ins/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/check_in#associations)

# check\_in\_group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_group`

Copy

[CheckInGroup](check_in_group.md)

# check\_in\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/check_in_times`

Copy

[CheckInTime](check_in_time.md)

# checked\_in\_at

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_in_at`

Copy

[Station](station.md)

# checked\_in\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_in_by`

Copy

[Person](person.md)

# checked\_out\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/checked_out_by`

Copy

[Person](person.md)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event`

Copy

[Event](event.md)

# event\_period

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period`

Copy

[EventPeriod](event_period.md)

# event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_times`

Copy

[EventTime](event_time.md)

# locations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/locations`

Copy

[Location](location.md)

# options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/options`

Copy

[Option](option.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/check_in#belongs-to)

# CheckInGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_in_groups/{check_in_group_id}/check_ins`

Copy

[CheckInGroup](check_in_group.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/check_ins`

Copy

[Event](event.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# EventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/check_ins`

Copy

[EventPeriod](event_period.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/check_ins`

Copy

[EventTime](event_time.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/check_ins`

Copy

[Location](location.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# LocationEventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/check_ins`

Copy

[LocationEventPeriod](location_event_period.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# LocationEventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/check_ins`

Copy

[LocationEventTime](location_event_time.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# Option

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/options/{option_id}/check_ins`

Copy

[Option](option.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins`

Copy

[Organization](organization.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/people/{person_id}/check_ins`

Copy

[Person](person.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`

# PersonEvent

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/first_check_in`

Copy

[PersonEvent](person_event.md)

# PersonEvent

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/person_events/{person_event_id}/last_check_in`

Copy

[PersonEvent](person_event.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/checked_in_at_check_ins`

Copy

[Station](station.md)

* `attendee`
* `checked_out`
* `first_time`
* `guest`
* `not_checked_out`
* `not_one_time_guest`
* `one_time_guest`
* `regular`
* `volunteer`