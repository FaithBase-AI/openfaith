Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

The root level of an organization where account-level settings are applied.

[# Example Request](#/apps/services/2018-11-01/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/services/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2)

[# Example Object](#/apps/services/2018-11-01/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "ccli": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "date_format": 1,
    "music_stand_enabled": true,
    "name": "string",
    "projector_enabled": true,
    "time_zone": "string",
    "twenty_four_hour_time": true,
    "updated_at": "2000-01-01T12:00:00Z",
    "owner_name": "string",
    "required_to_set_download_permission": "string",
    "secret": "string",
    "allow_mp3_download": true,
    "calendar_starts_on_sunday": true,
    "ccli_connected": true,
    "ccli_auto_reporting_enabled": true,
    "ccli_reporting_enabled": true,
    "extra_file_storage_allowed": true,
    "file_storage_exceeded": true,
    "file_storage_size": true,
    "file_storage_size_used": true,
    "file_storage_extra_enabled": true,
    "rehearsal_mix_enabled": true,
    "rehearsal_pack_connected": true,
    "legacy_id": "primary_key",
    "file_storage_extra_charges": 1,
    "people_allowed": 1,
    "people_remaining": 1,
    "beta": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`ccli`

`string`

`created_at`

`date_time`

`date_format`

`integer`

Two possible values, `US` `EU`

`music_stand_enabled`

`boolean`

`name`

`string`

`projector_enabled`

`boolean`

`time_zone`

`string`

`twenty_four_hour_time`

`boolean`

`updated_at`

`date_time`

`owner_name`

`string`

`required_to_set_download_permission`

`string`

Possible values: `editor`, `administrator`, `site_administrator`

`secret`

`string`

`allow_mp3_download`

`boolean`

`calendar_starts_on_sunday`

`boolean`

`ccli_connected`

`boolean`

`ccli_auto_reporting_enabled`

`boolean`

`ccli_reporting_enabled`

`boolean`

`extra_file_storage_allowed`

`boolean`

`file_storage_exceeded`

`boolean`

`file_storage_size`

`boolean`

`file_storage_size_used`

`boolean`

`file_storage_extra_enabled`

`boolean`

`rehearsal_mix_enabled`

`boolean`

`rehearsal_pack_connected`

`boolean`

`legacy_id`

`primary_key`

`file_storage_extra_charges`

`integer`

`people_allowed`

`integer`

`people_remaining`

`integer`

`beta`

`boolean`

[# URL Parameters](#/apps/services/2018-11-01/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/services/2018-11-01/vertices/organization#endpoints)

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

[# Associations](#/apps/services/2018-11-01/vertices/organization#associations)

# attachment\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/attachment_types`

Copy

[AttachmentType](attachment_type.md)

# chat

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/chat`

Copy

[Chat](chat.md)

# email\_templates

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/email_templates`

Copy

[EmailTemplate](email_template.md)

# folders

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/folders`

Copy

[Folder](folder.md)

# media

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/media`

Copy

[Media](media.md)

* `archived`
* `audio`
* `background_audio`
* `background_image`
* `background_video`
* `countdown`
* `curriculum`
* `document`
* `drama`
* `image`
* `not_archived`
* `powerpoint`
* `song_video`
* `video`

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people`

Copy

[Person](person.md)

# plans

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/plans`

Copy

[Organization](organization.md)

# report\_templates

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/report_templates`

Copy

[ReportTemplate](report_template.md)

* `matrix`
* `people`
* `plans`
* `without_defaults`

# series

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series`

Copy

[Series](series.md)

# service\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types`

Copy

[ServiceType](service_type.md)

* `no_parent`

# songs

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs`

Copy

[Song](song.md)

# tag\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/tag_groups`

Copy

[TagGroup](tag_group.md)

* `arrangement`
* `media`
* `person`
* `song`

# teams

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/organization#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/plans`

Copy

[Organization](organization.md)