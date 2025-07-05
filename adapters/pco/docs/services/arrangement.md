Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](arrangement.md)

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

# Arrangement

Each arrangement belongs to a song and is a different version of that song.

[# Example Request](#/apps/services/2018-11-01/vertices/arrangement#example-request)

```
curl https://api.planningcenteronline.com/services/v2/songs/{song_id}/arrangements
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/songs/{song_id}/arrangements)

[# Example Object](#/apps/services/2018-11-01/vertices/arrangement#example-object)

```
{
  "type": "Arrangement",
  "id": "1",
  "attributes": {
    "bpm": 1.42,
    "created_at": "2000-01-01T12:00:00Z",
    "has_chords": true,
    "length": 1,
    "meter": "string",
    "name": "string",
    "notes": "string",
    "print_margin": "string",
    "print_orientation": "string",
    "print_page_size": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "chord_chart": "string",
    "chord_chart_font": "string",
    "chord_chart_key": "string",
    "chord_chart_columns": 1,
    "chord_chart_font_size": 1,
    "has_chord_chart": true,
    "lyrics_enabled": true,
    "number_chart_enabled": true,
    "numeral_chart_enabled": true,
    "sequence": [],
    "sequence_short": [],
    "sequence_full": [],
    "chord_chart_chord_color": 1,
    "archived_at": "2000-01-01T12:00:00Z",
    "lyrics": "string"
  },
  "relationships": {
    "updated_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "song": {
      "data": {
        "type": "Song",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/arrangement#attributes)

Name

Type

Description

`id`

`primary_key`

`bpm`

`float`

`created_at`

`date_time`

`has_chords`

`boolean`

`length`

`integer`

`meter`

`string`

Possible Values:

* `2/2`
* `2/4`
* `3/2`
* `3/4`
* `4/2`
* `4/4`
* `5/4`
* `6/4`
* `3/8`
* `6/8`
* `7/4`
* `7/8`
* `9/8`
* `12/4`
* `12/8`

`name`

`string`

`notes`

`string`

`print_margin`

`string`

Possible Values:

* `0.0in`
* `0.25in`
* `0.5in`
* `0.75in`
* `1.0in`

`print_orientation`

`string`

Possible Values:

* `Portrait`
* `Landscape`

`print_page_size`

`string`

Possible Values:

* `Widescreen (16x9)`
* `Fullscreen (4x3)`
* `A4`
* `Letter`
* `Legal`
* `11x17`

`updated_at`

`date_time`

`chord_chart`

`string`

A string of lyrics and chords. Supports standard and ChordPro formats.

`chord_chart_font`

`string`

`chord_chart_key`

`string`

`chord_chart_columns`

`integer`

`chord_chart_font_size`

`integer`

Possible Values:

`10`, `11`, `12`, `13`, `14`, `15`, `16`, `18`, `20`, `22`, `24`, `26`, `28`, `32`, `36`, `42`, `48`

`has_chord_chart`

`boolean`

`lyrics_enabled`

`boolean`

`number_chart_enabled`

`boolean`

`numeral_chart_enabled`

`boolean`

`sequence`

`array`

An array of strings containing a label and a number describing the section:

['Verse 1', 'Chorus 1', 'Verse 2']

`sequence_short`

`array`

`sequence_full`

`array`

`chord_chart_chord_color`

`integer`

`archived_at`

`date_time`

`lyrics`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/arrangement#relationships)

Name

Type

Association Type

Note

updated\_by

Person

to\_one

created\_by

Person

to\_one

song

Song

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/arrangement#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

keys

include associated keys

include

sections

include associated sections

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

[# Endpoints](#/apps/services/2018-11-01/vertices/arrangement#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/songs/{song_id}/arrangements`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/songs/{song_id}/arrangements/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/songs/{song_id}/arrangements`

Copy

* bpm
* chord\_chart
* chord\_chart\_chord\_color
* chord\_chart\_columns
* chord\_chart\_font
* chord\_chart\_font\_size
* chord\_chart\_key
* length
* lyrics\_enabled
* meter
* name
* notes
* number\_chart\_enabled
* numeral\_chart\_enabled
* print\_margin
* print\_orientation
* print\_page\_size
* sequence

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/songs/{song_id}/arrangements/{id}`

Copy

* bpm
* chord\_chart
* chord\_chart\_chord\_color
* chord\_chart\_columns
* chord\_chart\_font
* chord\_chart\_font\_size
* chord\_chart\_key
* length
* lyrics\_enabled
* meter
* name
* notes
* number\_chart\_enabled
* numeral\_chart\_enabled
* print\_margin
* print\_orientation
* print\_page\_size
* sequence

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/songs/{song_id}/arrangements/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/arrangement#actions)

# assign\_tags

HTTP Method

Endpoint

Description

POST

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/assign_tags`

Copy

Used to assign tags to an arrangement.

Details:

All tags will be replaced so the full data set must be sent.

It expects a body that looks like:

```


```
{
	"data": {
		"type": "TagAssignment",
		"attributes": {},
		"relationships": {
			"tags": {
				"data": [
					{
						"type": "Tag",
						"id": "5"
					}
				]
			}
		}
	}
}

```


```

On success you will get back a `204 No Content`.

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/arrangement#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/attachments`

Copy

[Attachment](attachment.md)

# keys

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys`

Copy

[Key](key.md)

# sections

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/sections`

Copy

[ArrangementSections](arrangement_sections.md)

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/arrangement#belongs-to)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/arrangement`

Copy

[Item](item.md)

# Song

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements`

Copy

[Song](song.md)