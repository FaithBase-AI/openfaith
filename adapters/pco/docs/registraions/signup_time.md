Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](signup_time.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)

2025-05-01

Info

[Attendee](attendee.md)

[Campus](campus.md)

[Category](category.md)

[EmergencyContact](emergency_contact.md)

[Organization](organization.md)

[Person](person.md)

[Registration](registration.md)

[SelectionType](selection_type.md)

[Signup](signup.md)

[SignupLocation](signup_location.md)

[SignupTime](signup_time.md)

[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# SignupTime

`Signup_time`s are associated with a signup, which can have multiple signup times.

[# Example Request](#/apps/registrations/2025-05-01/vertices/signup_time#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/next_signup_time
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/next_signup_time)

[# Example Object](#/apps/registrations/2025-05-01/vertices/signup_time#example-object)

```
{
  "type": "SignupTime",
  "id": "1",
  "attributes": {
    "starts_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "all_day": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/signup_time#attributes)

Name

Type

Description

`id`

`primary_key`

`starts_at`

`date_time`

Start date and time of signup time.

`ends_at`

`date_time`

End date and time of signup time.

`all_day`

`boolean`

Whether or not the signup time is all day.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/signup_time#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/signup_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/next_signup_time`

Copy

Notes:

Organization admins can see all signup times for all signups.
Signup managers can only see the signup times for signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/next_signup_time/{id}`

Copy

Notes:

Organization admins can see all signup times for all signups.
Signup managers can only see the signup times for signups they manage.

[# Belongs To](#/apps/registrations/2025-05-01/vertices/signup_time#belongs-to)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/next_signup_time`

Copy

[Signup](signup.md)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/signup_times`

Copy

[Signup](signup.md)

* `future`
* `past`