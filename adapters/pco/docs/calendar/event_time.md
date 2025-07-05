Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_time.md)

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

# EventTime

Collection Only

Start and end times for each event instance.

In the Calendar UI, these are represented under the "Schedule" section and
may include "Setup" and "Teardown" times for the instance.

[# Example Request](#/apps/calendar/2022-07-07/vertices/event_time#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/event_instances/{event_instance_id}/event_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/event_instances/{event_instance_id}/event_times)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event_time#example-object)

```
{
  "type": "EventTime",
  "id": "1",
  "attributes": {
    "ends_at": "2000-01-01T12:00:00Z",
    "starts_at": "2000-01-01T12:00:00Z",
    "name": "2000-01-01T12:00:00Z",
    "visible_on_kiosks": true,
    "visible_on_widget_and_ical": true
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event_time#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the event time

`ends_at`

`date_time`

UTC time at which the event time ends

`starts_at`

`date_time`

UTC time at which the event time starts

`name`

`date_time`

Name of the event time

`visible_on_kiosks`

`boolean`

Set to `true` if the time is visible on kiosk

`visible_on_widget_and_ical`

`boolean`

Set to `true` if the time is visible on widget or iCal

[# Relationships](#/apps/calendar/2022-07-07/vertices/event_time#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event_time#url-parameters)

# Can Include

Parameter

Value

Description

include

event

include associated event

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

date\_time

Query on a specific name

`?where[name]=2000-01-01T12:00:00Z`

starts\_at

where[starts\_at]

date\_time

Query on a specific starts\_at

`?where[starts_at]=2000-01-01T12:00:00Z`

visible\_on\_kiosks

where[visible\_on\_kiosks]

boolean

Query on a specific visible\_on\_kiosks

`?where[visible_on_kiosks]=true`

visible\_on\_widget\_and\_ical

where[visible\_on\_widget\_and\_ical]

boolean

Query on a specific visible\_on\_widget\_and\_ical

`?where[visible_on_widget_and_ical]=true`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/event_instances/{event_instance_id}/event_times`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/event_time#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event_times/{event_time_id}/event`

Copy

[Event](event.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event_time#belongs-to)

# EventInstance

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/event_times`

Copy

[EventInstance](event_instance.md)