Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](blockout_schedule_conflict.md)

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

# BlockoutScheduleConflict

[# Example Request](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#example-request)

```
curl https://api.planningcenteronline.com/services/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2)

[# Example Object](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#example-object)

```
{
  "type": "BlockoutScheduleConflict",
  "id": "1",
  "attributes": {
    "dates": "string",
    "organization_name": "string",
    "person_avatar": "string",
    "person_name": "string",
    "position_display_times": "string",
    "service_type_name": "string",
    "short_dates": "string",
    "status": "string",
    "team_name": "string",
    "team_position_name": "string",
    "sort_date": "2000-01-01T12:00:00Z",
    "can_accept_partial": true
  },
  "relationships": {
    "organization": {
      "data": {
        "type": "Organization",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "plan_person": {
      "data": {
        "type": "PlanPerson",
        "id": "1"
      }
    },
    "service_type": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#attributes)

Name

Type

Description

`id`

`primary_key`

`dates`

`string`

`organization_name`

`string`

`person_avatar`

`string`

`person_name`

`string`

`position_display_times`

`string`

`service_type_name`

`string`

`short_dates`

`string`

`status`

`string`

`team_name`

`string`

`team_position_name`

`string`

`sort_date`

`date_time`

`can_accept_partial`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#relationships)

Name

Type

Association Type

Note

organization

Organization

to\_one

person

Person

to\_one

plan

Plan

to\_one

plan\_person

PlanPerson

to\_one

service\_type

ServiceType

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#url-parameters)

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

[# Endpoints](#/apps/services/2018-11-01/vertices/blockout_schedule_conflict#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/{id}`

Copy