Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](personal_access_token.md)

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

# PersonalAccessToken

[# Example Request](#/apps/api/2019-02-13/vertices/personal_access_token#example-request)

```
curl https://api.planningcenteronline.com/api/v2/personal_access_tokens
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/api/v2/personal_access_tokens)

[# Example Object](#/apps/api/2019-02-13/vertices/personal_access_token#example-object)

```
{
  "type": "PersonalAccessToken",
  "id": "1",
  "attributes": {
    "name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/api/2019-02-13/vertices/personal_access_token#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

[# URL Parameters](#/apps/api/2019-02-13/vertices/personal_access_token#url-parameters)

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

[# Endpoints](#/apps/api/2019-02-13/vertices/personal_access_token#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/api/v2/personal_access_tokens`

Copy

# Reading

HTTP Method

Endpoint

GET

`/api/v2/personal_access_tokens/{id}`

Copy

[# Belongs To](#/apps/api/2019-02-13/vertices/personal_access_token#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/api/v2/personal_access_tokens`

Copy

[Organization](organization.md)