Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](key.md)

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

# Key

Each song arrangement can have multiple keys. A key is the pitch center of the song.

[# Example Request](#/apps/services/2018-11-01/vertices/key#example-request)

```
curl https://api.planningcenteronline.com/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys)

[# Example Object](#/apps/services/2018-11-01/vertices/key#example-object)

```
{
  "type": "Key",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "alternate_keys": "string",
    "ending_key": "string",
    "starting_key": "string",
    "starting_minor": true,
    "ending_minor": true
  },
  "relationships": {
    "arrangement": {
      "data": {
        "type": "Arrangement",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/key#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`name`

`string`

`alternate_keys`

`string`

An array of objects.

`{ "name": "My Alternate Key", "key": "B" }`

`ending_key`

`string`

Possible Values:

`Ab`, `A`, `A#`, `Bb`, `B`, `C`, `C#`, `Db`, `D`, `D#`, `Eb`, `E`, `F`, `F#`, `Gb`, `G`, `G#`, `Abm`, `Am`, `A#m`, `Bbm`, `Bm`, `Cm`, `C#m`, `Dbm`, `Dm`, `D#m`, `Ebm`, `Em`, `Fm`, `F#m`, `Gbm`, `Gm`, `G#m`

To set the key to minor append `m` to the key. e.g. `Cm`

`starting_key`

`string`

Possible Values:

`Ab`, `A`, `A#`, `Bb`, `B`, `C`, `C#`, `Db`, `D`, `D#`, `Eb`, `E`, `F`, `F#`, `Gb`, `G`, `G#`, `Abm`, `Am`, `A#m`, `Bbm`, `Bm`, `Cm`, `C#m`, `Dbm`, `Dm`, `D#m`, `Ebm`, `Em`, `Fm`, `F#m`, `Gbm`, `Gm`, `G#m`

To set the key to minor append `m` to the key. e.g. `Cm`

`starting_minor`

`boolean`

`ending_minor`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/key#relationships)

Name

Type

Association Type

Note

arrangement

Arrangement

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/key#url-parameters)

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/key#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys`

Copy

* alternate\_keys
* ending\_key
* name
* starting\_key

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys/{id}`

Copy

* alternate\_keys
* ending\_key
* name
* starting\_key

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/key#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys/{key_id}/attachments`

Copy

[Attachment](attachment.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/key#belongs-to)

# Arrangement

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys`

Copy

[Arrangement](arrangement.md)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/key`

Copy

[Item](item.md)