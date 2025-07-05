Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](time_preference_option.md)

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

# TimePreferenceOption

A Service Time a person prefers to be scheduled to.

[# Example Request](#/apps/services/2018-11-01/vertices/time_preference_option#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/time_preference_options
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/time_preference_options)

[# Example Object](#/apps/services/2018-11-01/vertices/time_preference_option#example-object)

```
{
  "type": "TimePreferenceOption",
  "id": "1",
  "attributes": {
    "day_of_week": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "sort_index": "string",
    "time_type": "string",
    "minute_of_day": 1,
    "starts_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/time_preference_option#attributes)

Name

Type

Description

`id`

`primary_key`

`day_of_week`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`description`

`string`

`sort_index`

`string`

`time_type`

`string`

`minute_of_day`

`integer`

0 for 12:00 am, 1 for 12:01 am, 100 for 1:00 am, through 2359 for 11:59pm

`starts_at`

`date_time`

[# URL Parameters](#/apps/services/2018-11-01/vertices/time_preference_option#url-parameters)

# Order By

Parameter

Value

Type

Description

order

day\_of\_week

string

prefix with a hyphen (-day\_of\_week) to reverse the order

order

hour\_of\_day

string

prefix with a hyphen (-hour\_of\_day) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/time_preference_option#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/time_preference_options`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/time_preference_options/{id}`

Copy

[# Belongs To](#/apps/services/2018-11-01/vertices/time_preference_option#belongs-to)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/time_preference_options`

Copy

[ServiceType](service_type.md)