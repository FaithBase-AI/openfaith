Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](plan_person.md)

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

# PlanPerson

A person scheduled within a specific plan.

[# Example Request](#/apps/services/2018-11-01/vertices/plan_person#example-request)

```
curl https://api.planningcenteronline.com/services/v2/people/{person_id}/plan_people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/people/{person_id}/plan_people)

[# Example Object](#/apps/services/2018-11-01/vertices/plan_person#example-object)

```
{
  "type": "PlanPerson",
  "id": "1",
  "attributes": {
    "status": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "notes": "string",
    "decline_reason": "string",
    "name": "string",
    "notification_changed_by_name": "string",
    "notification_sender_name": "string",
    "team_position_name": "string",
    "photo_thumbnail": "string",
    "scheduled_by_name": "string",
    "status_updated_at": "2000-01-01T12:00:00Z",
    "notification_changed_at": "2000-01-01T12:00:00Z",
    "notification_prepared_at": "2000-01-01T12:00:00Z",
    "notification_read_at": "2000-01-01T12:00:00Z",
    "notification_sent_at": "2000-01-01T12:00:00Z",
    "prepare_notification": true,
    "can_accept_partial": true
  },
  "relationships": {
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
    "scheduled_by": {
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
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    },
    "responds_to": {
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
    },
    "service_times": {
      "data": [
        {
          "type": "PlanTime",
          "id": "1"
        }
      ]
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

[# Attributes](#/apps/services/2018-11-01/vertices/plan_person#attributes)

Name

Type

Description

`id`

`primary_key`

`status`

`string`

Accepts one of 'C', 'U', 'D', or 'Confirmed', 'Unconfirmed', or 'Declined'

`created_at`

`date_time`

`updated_at`

`date_time`

`notes`

`string`

`decline_reason`

`string`

`name`

`string`

`notification_changed_by_name`

`string`

`notification_sender_name`

`string`

`team_position_name`

`string`

`photo_thumbnail`

`string`

`scheduled_by_name`

`string`

Only available when requested with the `?fields` param

`status_updated_at`

`date_time`

`notification_changed_at`

`date_time`

`notification_prepared_at`

`date_time`

`notification_read_at`

`date_time`

`notification_sent_at`

`date_time`

`prepare_notification`

`boolean`

`can_accept_partial`

`boolean`

If the person is scheduled to a split team where they could potentially accept 1 time and decline another.

[# Relationships](#/apps/services/2018-11-01/vertices/plan_person#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

plan

Plan

to\_one

scheduled\_by

Person

to\_one

service\_type

ServiceType

to\_one

team

Team

to\_one

responds\_to

Person

to\_one

times

PlanTime

to\_many

service\_times

PlanTime

to\_many

time\_preference\_options

TimePreferenceOption

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/plan_person#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

declined\_plan\_times

include associated declined\_plan\_times

create and update

include

person

include associated person

create and update

include

plan

include associated plan

create and update

include

team

include associated team

create and update

# Query By

Name

Parameter

Type

Description

Example

team\_id

where[team\_id]

integer

Query on a related team

`?where[team_id]=1`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/plan_person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/plan_people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/plan_people/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/team_members`

Copy

* person\_id
* team\_id
* status
* decline\_reason
* notes
* team\_position\_name
* responds\_to\_id
* prepare\_notification
* notification\_prepared\_at

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/people/{person_id}/plan_people/{id}`

Copy

* person\_id
* team\_id
* status
* decline\_reason
* notes
* team\_position\_name
* responds\_to\_id
* prepare\_notification
* notification\_prepared\_at

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/people/{person_id}/plan_people/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/plan_person#associations)

# declined\_plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/declined_plan_times`

Copy

[PlanTime](plan_time.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/person`

Copy

[Person](person.md)

# plan

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/plan`

Copy

[Plan](plan.md)

# plan\_person\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/plan_person_times`

Copy

[PlanPersonTime](plan_person_time.md)

# plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/plan_times`

Copy

[PlanTime](plan_time.md)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/team`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/plan_person#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people`

Copy

[Person](person.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/team_members`

Copy

[Plan](plan.md)

* `confirmed`
* `not_archived`
* `not_declined`
* `not_deleted`

# PlanTemplate

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/team_members`

Copy

[PlanTemplate](plan_template.md)

* `confirmed`
* `not_archived`
* `not_declined`
* `not_deleted`