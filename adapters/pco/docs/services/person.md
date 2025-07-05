Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

A person added to Planning Center Services.

[# Example Request](#/apps/services/2018-11-01/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/services/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/people)

[# Example Object](#/apps/services/2018-11-01/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "photo_url": "string",
    "photo_thumbnail_url": "string",
    "preferred_app": "string",
    "assigned_to_rehearsal_team": true,
    "archived_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "first_name": "string",
    "last_name": "string",
    "name_prefix": "string",
    "name_suffix": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "facebook_id": "primary_key",
    "legacy_id": "primary_key",
    "anniversary": "2000-01-01T12:00:00Z",
    "birthdate": "2000-01-01T12:00:00Z",
    "full_name": "string",
    "media_permissions": "string",
    "permissions": "string",
    "song_permissions": "string",
    "status": "string",
    "max_permissions": "string",
    "max_plan_permissions": "string",
    "given_name": "string",
    "middle_name": "string",
    "nickname": "string",
    "archived": true,
    "site_administrator": true,
    "logged_in_at": "2000-01-01T12:00:00Z",
    "notes": "string",
    "passed_background_check": true,
    "ical_code": "string",
    "access_media_attachments": true,
    "access_plan_attachments": true,
    "access_song_attachments": true,
    "preferred_max_plans_per_day": 1,
    "preferred_max_plans_per_month": 1,
    "praise_charts_enabled": true,
    "me_tab": "string",
    "plans_tab": "string",
    "songs_tab": "string",
    "media_tab": "string",
    "people_tab": "string",
    "can_edit_all_people": true,
    "can_view_all_people": true,
    "onboardings": []
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "updated_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "current_folder": {
      "data": {
        "type": "Folder",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

`photo_url`

`string`

`photo_thumbnail_url`

`string`

`preferred_app`

`string`

`assigned_to_rehearsal_team`

`boolean`

`archived_at`

`date_time`

`created_at`

`date_time`

`first_name`

`string`

`last_name`

`string`

`name_prefix`

`string`

`name_suffix`

`string`

`updated_at`

`date_time`

`facebook_id`

`primary_key`

DEPRECATED: this attribute will be removed in the next release and will return the string "DEPRECATED" in this version

`legacy_id`

`primary_key`

If you've used Person.id from API v1 this attribute can be used to map from those old IDs to the new IDs used in API v2

`anniversary`

`date_time`

`birthdate`

`date_time`

`full_name`

`string`

`media_permissions`

`string`

`permissions`

`string`

`song_permissions`

`string`

`status`

`string`

`max_permissions`

`string`

`max_plan_permissions`

`string`

`given_name`

`string`

`middle_name`

`string`

`nickname`

`string`

`archived`

`boolean`

`site_administrator`

`boolean`

`logged_in_at`

`date_time`

`notes`

`string`

`passed_background_check`

`boolean`

`ical_code`

`string`

`access_media_attachments`

`boolean`

`access_plan_attachments`

`boolean`

`access_song_attachments`

`boolean`

`preferred_max_plans_per_day`

`integer`

`preferred_max_plans_per_month`

`integer`

`praise_charts_enabled`

`boolean`

`me_tab`

`string`

`plans_tab`

`string`

`songs_tab`

`string`

`media_tab`

`string`

`people_tab`

`string`

`can_edit_all_people`

`boolean`

`can_view_all_people`

`boolean`

`onboardings`

`array`

[# Relationships](#/apps/services/2018-11-01/vertices/person#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

updated\_by

Person

to\_one

current\_folder

Folder

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/person#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

emails

include associated emails

include

tags

include associated tags

include

team\_leaders

include associated team\_leaders

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

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

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

assigned\_to\_rehearsal\_team

where[assigned\_to\_rehearsal\_team]

boolean

Query on a specific assigned\_to\_rehearsal\_team

`?where[assigned_to_rehearsal_team]=true`

legacy\_id

where[legacy\_id]

primary\_key

Query on a specific legacy\_id

`?where[legacy_id]=primary_key`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/people/{id}`

Copy

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/people/{id}`

Copy

* preferred\_app
* onboardings
* access\_media\_attachments
* access\_plan\_attachments
* access\_song\_attachments
* current\_folder\_id
* media\_permissions
* permissions
* song\_permissions

[# Actions](#/apps/services/2018-11-01/vertices/person#actions)

# assign\_tags

HTTP Method

Endpoint

Description

POST

`/services/v2/people/{person_id}/assign_tags`

Copy

Used to assign tags to a person.

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

# collapse\_service\_types

HTTP Method

Endpoint

Description

POST

`/services/v2/people/{person_id}/collapse_service_types`

Copy

Used to set Service Types as collapsed for the Person

Details:

It expects a body that looks like:

```


```
{
	"data": {
		"type": "CollapseServiceTypes",
		"attributes": {},
		"relationships": {
			"service_type": {
				"data": [
					{
						"type": "ServiceType",
						"id": "1"
					},
					{
						"type": "ServiceType",
						"id": "2"
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

# expand\_service\_types

HTTP Method

Endpoint

Description

POST

`/services/v2/people/{person_id}/expand_service_types`

Copy

Used to set Service Types as expanded for the Person

Details:

It expects a body that looks like:

```


```
{
	"data": {
		"type": "ExpandServiceTypes",
		"attributes": {},
		"relationships": {
			"service_type": {
				"data": [
					{
						"type": "ServiceType",
						"id": "1"
					},
					{
						"type": "ServiceType",
						"id": "2"
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

[# Associations](#/apps/services/2018-11-01/vertices/person#associations)

# available\_signups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/available_signups`

Copy

[AvailableSignup](available_signup.md)

* `current_organization`

# blockouts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/blockouts`

Copy

[Blockout](blockout.md)

* `future`
* `past`

# emails

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/emails`

Copy

[Email](email.md)

# person\_team\_position\_assignments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/person_team_position_assignments`

Copy

[PersonTeamPositionAssignment](person_team_position_assignment.md)

* `not_archived`
* `not_deleted`

# plan\_people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people`

Copy

[PlanPerson](plan_person.md)

# schedules

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules`

Copy

[Schedule](schedule.md)

* `after` — Fetch schedules after the included `after` iso8601 date param. e.g. `?filter=after&after=2020-01-01T00:00:00Z`
* `all`
* `before` — Fetch schedules before the included `before` iso8601 date param. e.g. `?filter=before&before=2020-01-01T00:00:00Z`
* `future`
* `not_across_organizations`
* `past`
* `with_declined`

# scheduling\_preferences

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/scheduling_preferences`

Copy

[SchedulingPreference](scheduling_preference.md)

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/tags`

Copy

[Tag](tag.md)

# team\_leaders

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders`

Copy

[TeamLeader](team_leader.md)

* `not_archived`
* `not_deleted`

# text\_settings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/text_settings`

Copy

[TextSetting](text_setting.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/person#belongs-to)

# Live

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/controller`

Copy

[Live](live.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people`

Copy

[Organization](organization.md)

# PersonTeamPositionAssignment

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{person_team_position_assignment_id}/person`

Copy

[PersonTeamPositionAssignment](person_team_position_assignment.md)

# PlanPerson

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/person`

Copy

[PlanPerson](plan_person.md)

# Schedule

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/respond_to`

Copy

[Schedule](schedule.md)

# TeamLeader

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders/{team_leader_id}/people`

Copy

[TeamLeader](team_leader.md)

# Team

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/teams/{team_id}/people`

Copy

[Team](team.md)