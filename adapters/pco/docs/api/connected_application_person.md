Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](connected_application_person.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)

2019-02-13

Info

[ConnectedApplication](connected_application.md)

[ConnectedApplicationPerson](connected_application_person.md)

[OauthApplication](oauth_application.md)

[OauthApplicationMau](oauth_application_mau.md)

[Organization](organization.md)

[Person](person.md)

[PersonalAccessToken](personal_access_token.md)

[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# ConnectedApplicationPerson

[# Example Request](#/apps/api/2019-02-13/vertices/connected_application_person#example-request)

```
curl https://api.planningcenteronline.com/api/v2/connected_applications/{connected_application_id}/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/api/v2/connected_applications/{connected_application_id}/people)

[# Example Object](#/apps/api/2019-02-13/vertices/connected_application_person#example-object)

```
{
  "type": "ConnectedApplicationPerson",
  "id": "1",
  "attributes": {
    "first_name": "string",
    "last_name": "string",
    "avatar_url": "string",
    "connected_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/api/2019-02-13/vertices/connected_application_person#attributes)

Name

Type

Description

`id`

`primary_key`

`first_name`

`string`

`last_name`

`string`

`avatar_url`

`string`

`connected_at`

`date_time`

[# URL Parameters](#/apps/api/2019-02-13/vertices/connected_application_person#url-parameters)

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

[# Endpoints](#/apps/api/2019-02-13/vertices/connected_application_person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/api/v2/connected_applications/{connected_application_id}/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/api/v2/connected_applications/{connected_application_id}/people/{id}`

Copy

[# Belongs To](#/apps/api/2019-02-13/vertices/connected_application_person#belongs-to)

# ConnectedApplication

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/api/v2/connected_applications/{connected_application_id}/people`

Copy

[ConnectedApplication](connected_application.md)