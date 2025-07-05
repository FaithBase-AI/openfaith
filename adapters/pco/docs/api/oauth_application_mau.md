Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](oauth_application_mau.md)

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

# OauthApplicationMau

Monthly Active Users for an Oauth Application.

A "Monthly Active User" is any person who has been issued an Oauth token during that month.

Historical data will be kept for 24 months.

Note:

There is no historical data before mid-February 2019.

[# Example Request](#/apps/api/2019-02-13/vertices/oauth_application_mau#example-request)

```
curl https://api.planningcenteronline.com/api/v2/oauth_applications/{oauth_application_id}/mau
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/api/v2/oauth_applications/{oauth_application_id}/mau)

[# Example Object](#/apps/api/2019-02-13/vertices/oauth_application_mau#example-object)

```
{
  "type": "OauthApplicationMau",
  "id": "1",
  "attributes": {
    "count": 1,
    "month": 1,
    "year": 1
  },
  "relationships": {
    "oauth_application": {
      "data": {
        "type": "OauthApplication",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/api/2019-02-13/vertices/oauth_application_mau#attributes)

Name

Type

Description

Note

`id`

`primary_key`

`count`

`integer`

The total number of unique active users for the application.

`month`

`integer`

The month the stat was recorded for.

Starting at 1 for January.

`year`

`integer`

The year the stat was recorded for.

[# Relationships](#/apps/api/2019-02-13/vertices/oauth_application_mau#relationships)

Name

Type

Association Type

Note

oauth\_application

OauthApplication

to\_one

[# URL Parameters](#/apps/api/2019-02-13/vertices/oauth_application_mau#url-parameters)

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

[# Endpoints](#/apps/api/2019-02-13/vertices/oauth_application_mau#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/api/v2/oauth_applications/{oauth_application_id}/mau`

Copy

# Reading

HTTP Method

Endpoint

GET

`/api/v2/oauth_applications/{oauth_application_id}/mau/{id}`

Copy

[# Belongs To](#/apps/api/2019-02-13/vertices/oauth_application_mau#belongs-to)

# OauthApplication

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/api/v2/oauth_applications/{oauth_application_id}/mau`

Copy

[OauthApplication](oauth_application.md)