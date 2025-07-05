Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](schedule.md)

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

# Schedule

An instance of a PlanPerson with included data for displaying in a user's schedule

[# Example Request](#/apps/services/2018-11-01/vertices/schedule#example-request)

```
curl https://api.planningcenteronline.com/services/v2/people/{person_id}/schedules
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/people/{person_id}/schedules)

[# Example Object](#/apps/services/2018-11-01/vertices/schedule#example-object)

```
{
  "type": "Schedule",
  "id": "1",
  "attributes": {
    "sort_date": "2000-01-01T12:00:00Z",
    "dates": "string",
    "decline_reason": "string",
    "organization_name": "string",
    "organization_time_zone": "string",
    "organization_twenty_four_hour_time": "string",
    "person_name": "string",
    "position_display_times": "string",
    "responds_to_name": "string",
    "service_type_name": "string",
    "short_dates": "string",
    "status": "string",
    "team_name": "string",
    "team_position_name": "string",
    "can_accept_partial": true,
    "can_accept_partial_one_time": true,
    "can_rehearse": true,
    "plan_visible": true,
    "plan_visible_to_me": true
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "service_type": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    },
    "organization": {
      "data": {
        "type": "Organization",
        "id": "1"
      }
    },
    "plan_person": {
      "data": {
        "type": "PlanPerson",
        "id": "1"
      }
    },
    "plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    },
    "responds_to_person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "times": {
      "data": [
        {
          "type": "PlanTime",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/schedule#attributes)

Name

Type

Description

`id`

`primary_key`

`sort_date`

`date_time`

`dates`

`string`

`decline_reason`

`string`

`organization_name`

`string`

`organization_time_zone`

`string`

`organization_twenty_four_hour_time`

`string`

`person_name`

`string`

`position_display_times`

`string`

`responds_to_name`

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

`can_accept_partial`

`boolean`

`can_accept_partial_one_time`

`boolean`

`can_rehearse`

`boolean`

`plan_visible`

`boolean`

True if the scheduled Plan is visible to the scheduled Person

`plan_visible_to_me`

`boolean`

True if the scheduled Plan is visible to the current Person

[# Relationships](#/apps/services/2018-11-01/vertices/schedule#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

service\_type

ServiceType

to\_one

organization

Organization

to\_one

plan\_person

PlanPerson

to\_one

plan

Plan

to\_one

team

Team

to\_one

responds\_to\_person

Person

to\_one

times

PlanTime

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/schedule#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

plan\_times

include associated plan\_times

# Order By

Parameter

Value

Type

Description

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

plan\_id

where[plan\_id]

integer

Query on a related plan

`?where[plan_id]=1`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/schedule#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/schedules`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/schedules/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/schedule#actions)

# accept

HTTP Method

Endpoint

Description

POST

`/services/v2/people/{person_id}/schedules/{schedule_id}/accept`

Copy

Accept a Schedule

Details:

If this isn't a split time schedule, or you want to accept all times, an empty JSON body is accepted.

If the user wants to decline specific times you'll need to send the declined time IDs & a reason.

A POST body should be formated...

```


```
{
	"data": {
		"type": "ScheduleAccept",
		"attributes": {
			"reason": "Because reasons"
		},
		"relationships": {
			"declined_plan_times": {
				"data": [
          {
					  "type": "PlanTime",
					  "id": "1"
				  }
        ]
			}
		}
	}
}

```


```

Permissions:

Must be authenticated

# decline

HTTP Method

Endpoint

Description

POST

`/services/v2/people/{person_id}/schedules/{schedule_id}/decline`

Copy

Decline a Schedule

Details:

If this is a split time request, all times will be declined.

If you want to decline specific times see ScheduleAcceptAction.

A POST body should be formated...

```


```
{
	"data": {
		"type": "ScheduleDecline",
		"attributes": {
			"reason": "A user supplied reason for declining the request or an empty string."
		},
		"relationships": null
	}
}

```


```

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/schedule#associations)

# declined\_plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/declined_plan_times`

Copy

[PlanTime](plan_time.md)

# plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/plan_times`

Copy

[PlanTime](plan_time.md)

# respond\_to

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/respond_to`

Copy

[Person](person.md)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/team`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/schedule#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules`

Copy

[Person](person.md)

* `after` — Fetch schedules after the included `after` iso8601 date param. e.g. `?filter=after&after=2020-01-01T00:00:00Z`
* `all`
* `before` — Fetch schedules before the included `before` iso8601 date param. e.g. `?filter=before&before=2020-01-01T00:00:00Z`
* `future`
* `not_across_organizations`
* `past`
* `with_declined`

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/my_schedules`

Copy

[Plan](plan.md)