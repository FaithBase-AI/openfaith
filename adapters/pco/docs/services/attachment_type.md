Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attachment_type.md)

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

# AttachmentType

Create an Attachment Type for each type of file you might want only specific people to see. When you attach a file, you can specify an attachment type to then be able to link the file to a position.

[# Example Request](#/apps/services/2018-11-01/vertices/attachment_type#example-request)

```
curl https://api.planningcenteronline.com/services/v2/attachment_types
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/attachment_types)

[# Example Object](#/apps/services/2018-11-01/vertices/attachment_type#example-object)

```
{
  "type": "AttachmentType",
  "id": "1",
  "attributes": {
    "name": "string",
    "aliases": "string",
    "capoed_chord_charts": true,
    "chord_charts": true,
    "exclusions": "string",
    "lyrics": true,
    "number_charts": true,
    "numeral_charts": true,
    "built_in": true
  },
  "relationships": {
    "attachment_type_group": {
      "data": {
        "type": "AttachmentTypeGroup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/attachment_type#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`aliases`

`string`

`capoed_chord_charts`

`boolean`

`chord_charts`

`boolean`

`exclusions`

`string`

`lyrics`

`boolean`

`number_charts`

`boolean`

`numeral_charts`

`boolean`

`built_in`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/attachment_type#relationships)

Name

Type

Association Type

Note

attachment\_type\_group

AttachmentTypeGroup

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/attachment_type#url-parameters)

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/attachment_type#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/attachment_types`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/attachment_types/{id}`

Copy

[# Belongs To](#/apps/services/2018-11-01/vertices/attachment_type#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/attachment_types`

Copy

[Organization](organization.md)