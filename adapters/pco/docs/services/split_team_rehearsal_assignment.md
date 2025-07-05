Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](split_team_rehearsal_assignment.md)

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

# SplitTeamRehearsalAssignment

For Rehearsal/Other Times, maps a Split Team to selected Time Preference Options. For example, used to assign 8am Ushers to 7:30am call time, and 11am Ushers to 10:30am call time.

[# Example Request](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments)

[# Example Object](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#example-object)

```
{
  "type": "SplitTeamRehearsalAssignment",
  "id": "1",
  "attributes": {
    "schedule_special_service_times": true
  },
  "relationships": {
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    },
    "time_preference_options": {
      "data": [
        {
          "type": "TimePreferenceOption",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#attributes)

Name

Type

Description

`id`

`primary_key`

`schedule_special_service_times`

`boolean`

Controls if the related rehearsal/other time is assigned when a person is scheduled to a split team service time that does not match a Time Preference Option

[# Relationships](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#relationships)

Name

Type

Association Type

Note

team

Team

to\_one

time\_preference\_options

TimePreferenceOption

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#url-parameters)

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

[# Endpoints](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments`

Copy

* schedule\_special\_service\_times

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments/{id}`

Copy

* schedule\_special\_service\_times

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#associations)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments/{split_team_rehearsal_assignment_id}/team`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/split_team_rehearsal_assignment#belongs-to)

# PlanTime

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments`

Copy

[PlanTime](plan_time.md)