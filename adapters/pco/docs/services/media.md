Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](media.md)

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

# Media

A piece of media

[# Example Request](#/apps/services/2018-11-01/vertices/media#example-request)

```
curl https://api.planningcenteronline.com/services/v2/media
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/media)

[# Example Object](#/apps/services/2018-11-01/vertices/media#example-object)

```
{
  "type": "Media",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "themes": "string",
    "title": "string",
    "thumbnail_file_name": "string",
    "thumbnail_content_type": "string",
    "thumbnail_file_size": 1,
    "thumbnail_updated_at": "2000-01-01T12:00:00Z",
    "preview_file_name": "string",
    "preview_content_type": "string",
    "preview_file_size": 1,
    "preview_updated_at": "2000-01-01T12:00:00Z",
    "length": 1,
    "media_type": "string",
    "media_type_name": "string",
    "thumbnail_url": "string",
    "creator_name": "string",
    "preview_url": "string",
    "image_url": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/media#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`themes`

`string`

`title`

`string`

`thumbnail_file_name`

`string`

`thumbnail_content_type`

`string`

`thumbnail_file_size`

`integer`

`thumbnail_updated_at`

`date_time`

`preview_file_name`

`string`

`preview_content_type`

`string`

`preview_file_size`

`integer`

`preview_updated_at`

`date_time`

`length`

`integer`

`media_type`

`string`

Possible Values:

* `audio`
* `background_audio`
* `background_image`
* `background_video`
* `countdown`
* `curriculum`
* `document`
* `drama`
* `image`
* `powerpoint`
* `song_video`
* `video`

`media_type_name`

`string`

`thumbnail_url`

`string`

`creator_name`

`string`

`preview_url`

`string`

`image_url`

`string`

[# URL Parameters](#/apps/services/2018-11-01/vertices/media#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

attachments

include associated attachments

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

creator\_name

where[creator\_name]

string

Query on a specific creator\_name

`?where[creator_name]=string`

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/media#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/media`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/media/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/media`

Copy

* media\_type
* title
* creator\_name
* themes

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/media/{id}`

Copy

* media\_type
* title
* creator\_name
* themes

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/media/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/media#actions)

# archive

HTTP Method

Endpoint

Description

POST

`/services/v2/media/{media_id}/archive`

Copy

Archive a Media.

Details:

Accepts an optional `time` attribute (ISO 8601) for scheduling archival for a future time.

```


```
{
  "data": {
    "type": "MediaArchive",
    "attributes": {
      "time": "2025-10-04T00:00:00Z"
    }
  }
}

```


```

Permissions:

Must be authenticated

# assign\_tags

HTTP Method

Endpoint

Description

POST

`/services/v2/media/{media_id}/assign_tags`

Copy

Used to assign tags to a media.

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

# unarchive

HTTP Method

Endpoint

Description

POST

`/services/v2/media/{media_id}/unarchive`

Copy

Restore an archived Media.

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/media#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/media/{media_id}/attachments`

Copy

[Attachment](attachment.md)

# media\_schedules

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/media/{media_id}/media_schedules`

Copy

[MediaSchedule](media_schedule.md)

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/media/{media_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/media#belongs-to)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/media`

Copy

[Item](item.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/media`

Copy

[Organization](organization.md)

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