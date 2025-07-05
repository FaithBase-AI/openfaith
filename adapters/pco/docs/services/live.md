Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](live.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)

2018-11-01

Info

[Arrangement](arrangement.md)

[ArrangementSections](arrangement_sections.md)

[Attachment](attachment.md)

[AttachmentActivity](attachment_activity.md)

[AttachmentType](attachment_type.md)

[AttachmentTypeGroup](attachment_type_group.md)

[Attendance](attendance.md)

[AvailableSignup](available_signup.md)

[Blockout](blockout.md)

[BlockoutDate](blockout_date.md)

[BlockoutException](blockout_exception.md)

[BlockoutScheduleConflict](blockout_schedule_conflict.md)

[Chat](chat.md)

[Contributor](contributor.md)

[CustomSlide](custom_slide.md)

[Email](email.md)

[EmailTemplate](email_template.md)

[EmailTemplateRenderedResponse](email_template_rendered_response.md)

[Folder](folder.md)

[FolderPath](folder_path.md)

[Item](item.md)

[ItemNote](item_note.md)

[ItemNoteCategory](item_note_category.md)

[ItemTime](item_time.md)

[Key](key.md)

[Layout](layout.md)

[Live](live.md)

[LiveController](live_controller.md)

[Media](media.md)

[MediaSchedule](media_schedule.md)

[NeededPosition](needed_position.md)

[Organization](organization.md)

[Person](person.md)

[PersonTeamPositionAssignment](person_team_position_assignment.md)

[Plan](plan.md)

[PlanNote](plan_note.md)

[PlanNoteCategory](plan_note_category.md)

[PlanPerson](plan_person.md)

[PlanPersonTime](plan_person_time.md)

[PlanTemplate](plan_template.md)

[PlanTime](plan_time.md)

[PublicView](public_view.md)

[ReportTemplate](report_template.md)

[Schedule](schedule.md)

[ScheduledPerson](scheduled_person.md)

[SchedulingPreference](scheduling_preference.md)

[Series](series.md)

[ServiceType](service_type.md)

[ServiceTypePath](service_type_path.md)

[SignupSheet](signup_sheet.md)

[SignupSheetMetadata](signup_sheet_metadata.md)

[SkippedAttachment](skipped_attachment.md)

[Song](song.md)

[SongSchedule](song_schedule.md)

[SongbookStatus](songbook_status.md)

[SplitTeamRehearsalAssignment](split_team_rehearsal_assignment.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[Team](team.md)

[TeamLeader](team_leader.md)

[TeamPosition](team_position.md)

[TextSetting](text_setting.md)

[TimePreferenceOption](time_preference_option.md)

[Zoom](zoom.md)

[Webhooks](#/apps/webhooks)

# Live

[# Example Request](#/apps/services/2018-11-01/vertices/live#example-request)

```
curl https://api.planningcenteronline.com/services/v2/series/{series_id}/plans/{plan_id}/live
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/series/{series_id}/plans/{plan_id}/live)

[# Example Object](#/apps/services/2018-11-01/vertices/live#example-object)

```
{
  "type": "Live",
  "id": "1",
  "attributes": {
    "series_title": "string",
    "title": "string",
    "dates": "string",
    "live_channel": "string",
    "chat_room_channel": "string",
    "can_control": true,
    "can_take_control": true,
    "can_chat": true,
    "can_control_video_feed": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/live#attributes)

Name

Type

Description

`id`

`primary_key`

`series_title`

`string`

`title`

`string`

`dates`

`string`

`live_channel`

`string`

`chat_room_channel`

`string`

`can_control`

`boolean`

`can_take_control`

`boolean`

`can_chat`

`boolean`

`can_control_video_feed`

`boolean`

[# URL Parameters](#/apps/services/2018-11-01/vertices/live#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

controller

include associated controller

include

current\_item\_time

include associated current\_item\_time

include

items

include associated items

include

next\_item\_time

include associated next\_item\_time

include

service\_type

include associated service\_type

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

[# Endpoints](#/apps/services/2018-11-01/vertices/live#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/series/{series_id}/plans/{plan_id}/live`

Copy

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/series/{series_id}/plans/{plan_id}/live/{id}`

Copy

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/series/{series_id}/plans/{plan_id}/live/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/live#actions)

# go\_to\_next\_item

HTTP Method

Endpoint

POST

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/go_to_next_item`

Copy

Permissions:

Must be authenticated

# go\_to\_previous\_item

HTTP Method

Endpoint

POST

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/go_to_previous_item`

Copy

Permissions:

Must be authenticated

# toggle\_control

HTTP Method

Endpoint

POST

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/toggle_control`

Copy

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/live#associations)

# controller

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/controller`

Copy

[Person](person.md)

# current\_item\_time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/current_item_time`

Copy

[ItemTime](item_time.md)

# items

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/items`

Copy

[Item](item.md)

# next\_item\_time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/next_item_time`

Copy

[ItemTime](item_time.md)

# service\_type

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/service_type`

Copy

[ServiceType](service_type.md)

# watchable\_plans

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/watchable_plans`

Copy

[Plan](plan.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/live#belongs-to)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/live`

Copy

[Plan](plan.md)