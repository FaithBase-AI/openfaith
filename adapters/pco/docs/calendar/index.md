Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](index.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)

2022-07-07

Info

[Attachment](vertices/attachment.md)

[Conflict](vertices/conflict.md)

[Event](vertices/event.md)

[EventConnection](vertices/event_connection.md)

[EventInstance](vertices/event_instance.md)

[EventResourceAnswer](vertices/event_resource_answer.md)

[EventResourceRequest](vertices/event_resource_request.md)

[EventTime](vertices/event_time.md)

[Feed](vertices/feed.md)

[JobStatus](vertices/job_status.md)

[Organization](vertices/organization.md)

[Person](vertices/person.md)

[ReportTemplate](vertices/report_template.md)

[RequiredApproval](vertices/required_approval.md)

[Resource](vertices/resource.md)

[ResourceApprovalGroup](vertices/resource_approval_group.md)

[ResourceBooking](vertices/resource_booking.md)

[ResourceFolder](vertices/resource_folder.md)

[ResourceQuestion](vertices/resource_question.md)

[ResourceSuggestion](vertices/resource_suggestion.md)

[RoomSetup](vertices/room_setup.md)

[Tag](vertices/tag.md)

[TagGroup](vertices/tag_group.md)

[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# 2022-07-07

Renamed recurrence\_description attribute on `EventInstance` to compact\_recurrence\_description.

# Changes

Type

Changes to

Notes

breaking

`calendar_instance`

Renamed `recurrence_description` attribute to `compact_recurrence_description`

breaking

`event_instance`

Renamed `recurrence_description` attribute to `compact_recurrence_description`

breaking

`event`

Added `featured` attribute