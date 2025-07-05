Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](required_approval.md)

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

# RequiredApproval

Represents the relationship between a Resource and a Resource Approval Group.

[# Example Request](#/apps/calendar/2022-07-07/vertices/required_approval#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals)

[# Example Object](#/apps/calendar/2022-07-07/vertices/required_approval#example-object)

```
{
  "type": "RequiredApproval",
  "id": "1",
  "attributes": {},
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/required_approval#attributes)

Name

Type

Description

`id`

`primary_key`

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/required_approval#url-parameters)

# Can Include

Parameter

Value

Description

include

resource

include associated resource

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/required_approval#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/required_approval#associations)

# resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals/{required_approval_id}/resource`

Copy

[Resource](resource.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/required_approval#belongs-to)

# ResourceApprovalGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals`

Copy

[ResourceApprovalGroup](resource_approval_group.md)

* `resources`
* `rooms`

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/required_approvals`

Copy

[Resource](resource.md)