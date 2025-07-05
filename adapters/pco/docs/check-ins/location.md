Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](location.md)

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

# Location

A place where people may check in to for a given event.
Some locations have `kind="Folder"`, which means that people
can't check-in here, but this location contains other locations.
You can get its contents from the `locations` attribute.
You can get a location's parent folder from the `parent` attribute.
(If it's not in a folder, `parent` will be empty.)

[# Example Request](#/apps/check-ins/2025-05-28/vertices/location#example-request)

```
curl https://api.planningcenteronline.com/check-ins/v2/locations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/check-ins/v2/locations)

[# Example Object](#/apps/check-ins/2025-05-28/vertices/location#example-object)

```
{
  "type": "Location",
  "id": "1",
  "attributes": {
    "name": "string",
    "kind": "string",
    "opened": true,
    "questions": "string",
    "age_min_in_months": 1,
    "age_max_in_months": 1,
    "age_range_by": "string",
    "age_on": "2000-01-01",
    "child_or_adult": "string",
    "effective_date": "2000-01-01",
    "gender": "string",
    "grade_min": 1,
    "grade_max": 1,
    "max_occupancy": 1,
    "min_volunteers": 1,
    "attendees_per_volunteer": 1,
    "position": 1,
    "updated_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "milestone": "string"
  },
  "relationships": {
    "parent": {
      "data": {
        "type": "Parent",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/check-ins/2025-05-28/vertices/location#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`kind`

`string`

`opened`

`boolean`

`questions`

`string`

`age_min_in_months`

`integer`

`age_max_in_months`

`integer`

`age_range_by`

`string`

`age_on`

`date`

`child_or_adult`

`string`

`effective_date`

`date`

`gender`

`string`

`grade_min`

`integer`

`grade_max`

`integer`

`max_occupancy`

`integer`

`min_volunteers`

`integer`

`attendees_per_volunteer`

`integer`

`position`

`integer`

`updated_at`

`date_time`

`created_at`

`date_time`

`milestone`

`string`

[# Relationships](#/apps/check-ins/2025-05-28/vertices/location#relationships)

Name

Type

Association Type

Note

parent

Parent

to\_one

[# URL Parameters](#/apps/check-ins/2025-05-28/vertices/location#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

event

include associated event

include

locations

include associated locations

include

options

include associated options

include

parent

include associated parent

create and update

# Order By

Parameter

Value

Type

Description

order

kind

string

prefix with a hyphen (-kind) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

position

string

prefix with a hyphen (-position) to reverse the order

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

[# Endpoints](#/apps/check-ins/2025-05-28/vertices/location#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/check-ins/v2/locations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/check-ins/v2/locations/{id}`

Copy

[# Associations](#/apps/check-ins/2025-05-28/vertices/location#associations)

# check\_ins

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/check_ins`

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

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/event`

Copy

[Event](event.md)

# integration\_links

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/integration_links`

Copy

[IntegrationLink](integration_link.md)

# location\_event\_periods

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/location_event_periods`

Copy

[LocationEventPeriod](location_event_period.md)

# location\_event\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/location_event_times`

Copy

[LocationEventTime](location_event_time.md)

# location\_labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/location_labels`

Copy

[LocationLabel](location_label.md)

# locations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/locations`

Copy

[Location](location.md)

# options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/options`

Copy

[Option](option.md)

# parent

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/parent`

Copy

[Location](location.md)

[# Belongs To](#/apps/check-ins/2025-05-28/vertices/location#belongs-to)

# CheckIn

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/locations`

Copy

[CheckIn](check_in.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/events/{event_id}/locations`

Copy

[Event](event.md)

* `locations`
* `root`

# EventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/available_locations`

Copy

[EventTime](event_time.md)

* `for_current_station`

# LocationEventPeriod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/check_ins/{check_in_id}/event_period/{event_period_id}/location_event_periods/{location_event_period_id}/location`

Copy

[LocationEventPeriod](location_event_period.md)

# LocationEventTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/event_times/{event_time_id}/location_event_times/{location_event_time_id}/location`

Copy

[LocationEventTime](location_event_time.md)

# LocationLabel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/labels/{label_id}/location_labels/{location_label_id}/location`

Copy

[LocationLabel](location_label.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/locations`

Copy

[Location](location.md)

# Location

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/locations/{location_id}/parent`

Copy

[Location](location.md)

# Station

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/check-ins/v2/stations/{station_id}/location`

Copy

[Station](station.md)