Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](song.md)

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

# Song

A song

[# Example Request](#/apps/services/2018-11-01/vertices/song#example-request)

```
curl https://api.planningcenteronline.com/services/v2/songs
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/songs)

[# Example Object](#/apps/services/2018-11-01/vertices/song#example-object)

```
{
  "type": "Song",
  "id": "1",
  "attributes": {
    "title": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "admin": "string",
    "author": "string",
    "copyright": "string",
    "hidden": true,
    "notes": "string",
    "themes": "string",
    "last_scheduled_short_dates": "string",
    "last_scheduled_at": "2000-01-01T12:00:00Z",
    "ccli_number": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/song#attributes)

Name

Type

Description

`id`

`primary_key`

`title`

`string`

The name of the song.

When setting this value on a create you can pass a CCLI number and Services will fetch the song metadata for you.

`created_at`

`date_time`

`updated_at`

`date_time`

`admin`

`string`

`author`

`string`

`copyright`

`string`

`hidden`

`boolean`

`notes`

`string`

`themes`

`string`

`last_scheduled_short_dates`

`string`

`last_scheduled_at`

`date_time`

`ccli_number`

`integer`

[# URL Parameters](#/apps/services/2018-11-01/vertices/song#url-parameters)

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

last\_scheduled\_at

string

prefix with a hyphen (-last\_scheduled\_at) to reverse the order

order

title

string

prefix with a hyphen (-title) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

author

where[author]

string

Query on a specific author

`?where[author]=string`

ccli\_number

where[ccli\_number]

integer

Query on a specific ccli\_number

`?where[ccli_number]=1`

hidden

where[hidden]

boolean

Query on a specific hidden

`?where[hidden]=true`

themes

where[themes]

string

Query on a specific themes

`?where[themes]=string`

title

where[title]

string

Query on a specific title

`?where[title]=string`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/song#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/songs`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/songs/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/songs`

Copy

* title
* admin
* author
* copyright
* ccli\_number
* hidden
* themes

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/songs/{id}`

Copy

* title
* admin
* author
* copyright
* ccli\_number
* hidden
* themes

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/songs/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/song#actions)

# assign\_tags

HTTP Method

Endpoint

Description

POST

`/services/v2/songs/{song_id}/assign_tags`

Copy

Used to assign tags to a song.

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

[# Associations](#/apps/services/2018-11-01/vertices/song#associations)

# arrangements

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements`

Copy

[Arrangement](arrangement.md)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/attachments`

Copy

[Attachment](attachment.md)

# last\_scheduled\_item

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/last_scheduled_item`

Copy

[Item](item.md)

The Song's most recently scheduled Item in a given Service Type.
Requires a `service_type` query parameter.
e.g. `?service_type=789`

# song\_schedules

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/song_schedules`

Copy

[SongSchedule](song_schedule.md)

* `three_most_recent`

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/songs/{song_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/song#belongs-to)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/song`

Copy

[Item](item.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs`

Copy

[Organization](organization.md)